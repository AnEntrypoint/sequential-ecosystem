import { storage } from '@sequentialos/storage-unified';
import logger from '@sequentialos/sequential-logging';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class FlowRegistry {
  constructor(basePath) {
    this.basePath = basePath;
    this.flows = new Map();
  }

  async loadAll() {
    try {
      const flowDirs = await storage.list(this.basePath);

      for (const entry of flowDirs) {
        const dirName = entry.name || entry;
        const flowPath = path.join(this.basePath, dirName);
        const flowConfigPath = path.join(flowPath, 'config.json');
        await this.load(flowConfigPath);
      }

      logger.info(`[FlowRegistry] Loaded ${this.flows.size} flows`);
    } catch (err) {
      logger.error(`[FlowRegistry] Failed to load flows:`, err);
    }
  }

  async load(flowConfigPath) {
    try {
      const flowDir = path.dirname(flowConfigPath);
      const flowName = path.basename(flowDir);

      const flowConfig = await storage.readJson(flowConfigPath);

      this.flows.set(flowName, {
        config: flowConfig,
        path: flowConfigPath,
        name: flowName,
        loadedAt: new Date()
      });

      logger.debug(`[FlowRegistry] Loaded flow: ${flowName}`);
    } catch (err) {
      logger.error(`[FlowRegistry] Failed to load ${flowConfigPath}:`, err);
    }
  }

  async reload(flowPath) {
    const flowDir = path.dirname(path.dirname(flowPath));
    const flowName = path.basename(flowDir);
    logger.info(`[FlowRegistry] Reloading flow: ${flowName}`);
    await this.load(path.join(flowDir, 'config.json'));
  }

  get(flowName) {
    return this.flows.get(flowName);
  }

  list() {
    return Array.from(this.flows.keys());
  }

  register(flowName, config) {
    this.flows.set(flowName, {
      config,
      name: flowName,
      loadedAt: new Date(),
      path: null
    });
  }

  unregister(flowName) {
    this.flows.delete(flowName);
  }
}

export const flowRegistry = new FlowRegistry(
  path.join(process.cwd(), 'flows')
);
