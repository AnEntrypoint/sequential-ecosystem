import { createFileWatcher } from '@sequentialos/file-watcher';
import { taskRegistry } from '@sequentialos/task-registry';
import { flowRegistry } from '@sequentialos/flow-registry';
import { toolRegistry } from '@sequentialos/tool-registry';
import logger from '@sequentialos/sequential-logging';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class HotReloadManager {
  constructor(options = {}) {
    this.basePath = options.basePath || process.cwd();
    this.watcher = null;
    this.enabled = options.enabled !== false;
  }

  start() {
    if (!this.enabled) {
      logger.info('[HotReloadManager] Disabled (HOT_RELOAD=false)');
      return;
    }

    const watchPaths = [
      path.join(this.basePath, 'tasks'),
      path.join(this.basePath, 'flows'),
      path.join(this.basePath, 'tools')
    ];

    this.watcher = createFileWatcher(watchPaths, { debounceMs: 300 });

    this.watcher.on('file:changed', async (filePath) => {
      if (filePath.includes('/tasks/')) {
        logger.info(`[HotReload] Task changed: ${filePath}`);
        try {
          const taskDir = path.dirname(filePath);
          const taskIndexPath = path.join(taskDir, 'index.js');
          await taskRegistry.reload(taskIndexPath);
        } catch (err) {
          logger.error(`[HotReload] Failed to reload task:`, err);
        }
      }
    });

    this.watcher.on('file:changed', async (filePath) => {
      if (filePath.includes('/flows/')) {
        logger.info(`[HotReload] Flow changed: ${filePath}`);
        try {
          const flowDir = path.dirname(filePath);
          const flowConfigPath = path.join(flowDir, 'config.json');
          if (filePath.endsWith('config.json')) {
            await flowRegistry.reload(flowConfigPath);
          }
        } catch (err) {
          logger.error(`[HotReload] Failed to reload flow:`, err);
        }
      }
    });

    this.watcher.on('file:changed', async (filePath) => {
      if (filePath.includes('/tools/')) {
        logger.info(`[HotReload] Tool changed: ${filePath}`);
        try {
          if (filePath.endsWith('.json')) {
            await toolRegistry.reload(filePath);
          }
        } catch (err) {
          logger.error(`[HotReload] Failed to reload tool:`, err);
        }
      }
    });

    this.watcher.on('file:added', async (filePath) => {
      if (filePath.includes('/tasks/') && filePath.endsWith('index.js')) {
        logger.info(`[HotReload] Task added: ${filePath}`);
        try {
          await taskRegistry.reload(filePath);
        } catch (err) {
          logger.error(`[HotReload] Failed to load task:`, err);
        }
      }
    });

    this.watcher.on('file:added', async (filePath) => {
      if (filePath.includes('/flows/') && filePath.endsWith('config.json')) {
        logger.info(`[HotReload] Flow added: ${filePath}`);
        try {
          await flowRegistry.reload(filePath);
        } catch (err) {
          logger.error(`[HotReload] Failed to load flow:`, err);
        }
      }
    });

    this.watcher.on('file:added', async (filePath) => {
      if (filePath.includes('/tools/') && filePath.endsWith('.json')) {
        logger.info(`[HotReload] Tool added: ${filePath}`);
        try {
          await toolRegistry.reload(filePath);
        } catch (err) {
          logger.error(`[HotReload] Failed to load tool:`, err);
        }
      }
    });

    this.watcher.start();
    logger.info('[HotReloadManager] Started - watching for file changes');
  }

  stop() {
    if (this.watcher) {
      this.watcher.stop();
      logger.info('[HotReloadManager] Stopped');
    }
  }

  isRunning() {
    return this.watcher?.isWatching() || false;
  }
}

export const hotReloadManager = new HotReloadManager();
