import { storage } from '@sequentialos/storage-unified';
import logger from '@sequentialos/sequential-logging';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class TaskRegistry {
  constructor(basePath) {
    this.basePath = basePath;
    this.tasks = new Map();
  }

  async loadAll() {
    try {
      const taskDirs = await storage.list(this.basePath);

      for (const entry of taskDirs) {
        const dirName = entry.name || entry;
        const taskPath = path.join(this.basePath, dirName);
        const taskIndexPath = path.join(taskPath, 'index.js');
        await this.load(taskIndexPath);
      }

      logger.info(`[TaskRegistry] Loaded ${this.tasks.size} tasks`);
    } catch (err) {
      logger.error(`[TaskRegistry] Failed to load tasks:`, err);
    }
  }

  async load(taskPath) {
    try {
      const taskDir = path.dirname(taskPath);
      const taskName = path.basename(taskDir);

      // Dynamic import with cache busting
      const taskModule = await import(`${taskPath}?v=${Date.now()}`);

      this.tasks.set(taskName, {
        handler: taskModule.default || taskModule.execute || taskModule,
        path: taskPath,
        name: taskName,
        loadedAt: new Date(),
        config: taskModule.config
      });

      logger.debug(`[TaskRegistry] Loaded task: ${taskName}`);
    } catch (err) {
      logger.error(`[TaskRegistry] Failed to load ${taskPath}:`, err);
    }
  }

  async reload(taskPath) {
    const taskDir = path.dirname(path.dirname(taskPath));
    const taskName = path.basename(taskDir);
    logger.info(`[TaskRegistry] Reloading task: ${taskName}`);
    await this.load(path.join(taskDir, 'index.js'));
  }

  get(taskName) {
    return this.tasks.get(taskName);
  }

  list() {
    return Array.from(this.tasks.keys());
  }

  register(taskName, handler, config = {}) {
    this.tasks.set(taskName, {
      handler,
      name: taskName,
      loadedAt: new Date(),
      config,
      path: null
    });
  }

  unregister(taskName) {
    this.tasks.delete(taskName);
  }
}

export const taskRegistry = new TaskRegistry(
  path.join(process.cwd(), 'tasks')
);
