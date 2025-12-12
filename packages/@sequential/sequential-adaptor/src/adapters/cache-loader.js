/**
 * cache-loader.js - Cache initialization and loading
 *
 * Loads persisted data into memory caches
 */

import fs from 'fs';
import path from 'path';
import { readJsonFile, ensureDirectory } from '@sequentialos/file-operations';

export class CacheLoader {
  constructor(basePath, taskRunsCache, stackRunsCache, keystoreCache) {
    this.basePath = basePath;
    this.taskRunsCache = taskRunsCache;
    this.stackRunsCache = stackRunsCache;
    this.keystoreCache = keystoreCache;
  }

  async init() {
    await ensureDirectory(this.basePath);
    await this.loadCaches();
  }

  async loadCaches() {
    if (fs.existsSync(this.basePath)) {
      const files = fs.readdirSync(this.basePath);
      for (const file of files) {
        if (file.endsWith('.json') && file.startsWith('task-run-')) {
          const id = file.replace('task-run-', '').replace('.json', '');
          const data = await readJsonFile(path.join(this.basePath, file));
          this.taskRunsCache.set(id, data);
        }
        if (file.endsWith('.json') && file.startsWith('stack-run-')) {
          const id = file.replace('stack-run-', '').replace('.json', '');
          const data = await readJsonFile(path.join(this.basePath, file));
          this.stackRunsCache.set(id, data);
        }
        if (file === 'keystore.json') {
          const data = await readJsonFile(path.join(this.basePath, file));
          Object.entries(data).forEach(([k, v]) => this.keystoreCache.set(k, v));
        }
      }
    }
  }
}
