import { createFileWatcher } from 'file-watcher';
import { taskRegistry } from 'task-registry';
import { flowRegistry } from 'flow-registry';
import { toolRegistry } from 'tool-registry';
import logger from 'sequential-logging';
import EventEmitter from 'eventemitter3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class HotReloadManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.basePath = options.basePath || process.cwd();
    this.watcher = null;
    this.enabled = options.enabled !== false;
    this.debounceMs = 300;
    this.changeTimers = new Map();
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

    this.watcher.on('file:changed', (filePath) => {
      this._handleFileChange(filePath, 'changed');
    });

    this.watcher.on('file:added', (filePath) => {
      this._handleFileChange(filePath, 'added');
    });

    this.watcher.start();
    logger.info('[HotReloadManager] Started - watching for file changes');
  }

  async _handleFileChange(filePath, eventType) {
    const key = `${eventType}:${filePath}`;
    const existingTimer = this.changeTimers.get(key);

    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(async () => {
      this.changeTimers.delete(key);
      await this._processFileChange(filePath, eventType);
    }, this.debounceMs);

    this.changeTimers.set(key, timer);
  }

  async _processFileChange(filePath, eventType) {
    try {
      if (filePath.includes('/tasks/') && filePath.endsWith('index.js')) {
        logger.info(`[HotReload] Task ${eventType}: ${filePath}`);
        await taskRegistry.reload(filePath);
        this.emit('reload', { type: 'task', filePath, eventType });
      } else if (filePath.includes('/flows/') && filePath.endsWith('config.json')) {
        logger.info(`[HotReload] Flow ${eventType}: ${filePath}`);
        await flowRegistry.reload(filePath);
        this.emit('reload', { type: 'flow', filePath, eventType });
      } else if (filePath.includes('/tools/') && filePath.endsWith('.json')) {
        logger.info(`[HotReload] Tool ${eventType}: ${filePath}`);
        await toolRegistry.reload(filePath);
        this.emit('reload', { type: 'tool', filePath, eventType });
      }
    } catch (err) {
      logger.error(`[HotReload] Failed to process ${eventType}:`, err);
    }
  }

  stop() {
    if (this.watcher) {
      this.watcher.stop();
    }

    this.changeTimers.forEach(timer => clearTimeout(timer));
    this.changeTimers.clear();
    logger.info('[HotReloadManager] Stopped');
  }

  isRunning() {
    return this.watcher?.isWatching() || false;
  }
}

export const hotReloadManager = new HotReloadManager();
