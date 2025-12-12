/**
 * function-storage.js - Task function storage and retrieval
 *
 * Manages task function code and metadata persistence
 */

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { nowISO } from '@sequentialos/timestamp-utilities';
import { readJsonFile, writeFileAtomicJson, ensureDirectory } from '@sequentialos/file-operations';

export class FunctionStorage {
  constructor(basePath) {
    this.basePath = basePath;
  }

  async store(taskFunction) {
    const id = taskFunction.id || randomUUID();
    const funcDir = path.join(this.basePath, 'functions', id);
    await ensureDirectory(funcDir);
    await writeFileAtomicJson(
      path.join(funcDir, 'metadata.json'),
      { id, name: taskFunction.name, createdAt: nowISO() }
    );
    if (taskFunction.code) {
      fs.writeFileSync(path.join(funcDir, 'code.js'), taskFunction.code);
    }
    return { id, name: taskFunction.name };
  }

  async get(identifier) {
    const funcDir = path.join(this.basePath, 'functions', identifier);
    if (!fs.existsSync(funcDir)) return null;
    const code = fs.readFileSync(path.join(funcDir, 'code.js'), 'utf-8');
    const metadata = await readJsonFile(path.join(funcDir, 'metadata.json'));
    return { ...metadata, code };
  }
}
