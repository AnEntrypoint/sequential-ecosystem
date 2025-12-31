import { storage } from '@sequentialos/storage-unified';
import logger from '@sequentialos/sequential-logging';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ToolRegistry {
  constructor(basePath) {
    this.basePath = basePath;
    this.tools = new Map();
  }

  async loadAll() {
    try {
      const toolFiles = await storage.list(this.basePath);

      for (const entry of toolFiles) {
        const fileName = entry.name || entry;
        if (fileName.endsWith('.json') && !entry.isDirectory) {
          const toolPath = path.join(this.basePath, fileName);
          await this.load(toolPath);
        }
      }

      logger.info(`[ToolRegistry] Loaded ${this.tools.size} tools`);
    } catch (err) {
      logger.error(`[ToolRegistry] Failed to load tools:`, err);
    }
  }

  async load(toolPath) {
    try {
      const toolDef = await storage.readJson(toolPath);
      const fullName = `${toolDef.category || 'default'}:${toolDef.name}`;

      this.tools.set(fullName, {
        ...toolDef,
        path: toolPath,
        loadedAt: new Date()
      });

      logger.debug(`[ToolRegistry] Loaded tool: ${fullName}`);
    } catch (err) {
      logger.error(`[ToolRegistry] Failed to load ${toolPath}:`, err);
    }
  }

  async reload(toolPath) {
    logger.debug(`[ToolRegistry] Reloading tool: ${toolPath}`);
    await this.load(toolPath);
  }

  get(fullName) {
    return this.tools.get(fullName);
  }

  list() {
    return Array.from(this.tools.keys());
  }

  register(fullName, toolDef) {
    this.tools.set(fullName, { ...toolDef, loadedAt: new Date() });
  }

  unregister(fullName) {
    this.tools.delete(fullName);
  }
}

export const toolRegistry = new ToolRegistry(
  path.join(process.cwd(), 'tools')
);
