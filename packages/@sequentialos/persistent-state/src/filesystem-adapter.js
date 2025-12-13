import fs from 'fs-extra';
import path from 'path';

export class FileSystemAdapter {
  constructor(dataDir = './data') {
    this.dataDir = dataDir;
  }

  async _ensureDir(type) {
    const typeDir = path.join(this.dataDir, type);
    await fs.ensureDir(typeDir);
    return typeDir;
  }

  _getFilePath(type, id) {
    return path.join(this.dataDir, type, `${id}.json`);
  }

  async get(type, id) {
    try {
      const filePath = this._getFilePath(type, id);
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
      }
      return null;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async set(type, id, data) {
    const typeDir = await this._ensureDir(type);
    const filePath = path.join(typeDir, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async delete(type, id) {
    const filePath = this._getFilePath(type, id);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  }

  async clear(type) {
    if (type) {
      const typeDir = path.join(this.dataDir, type);
      if (await fs.pathExists(typeDir)) {
        await fs.emptyDir(typeDir);
      }
    } else {
      if (await fs.pathExists(this.dataDir)) {
        await fs.emptyDir(this.dataDir);
      }
    }
  }

  async getAll(type) {
    try {
      const typeDir = path.join(this.dataDir, type);
      if (!await fs.pathExists(typeDir)) {
        return [];
      }

      const files = await fs.readdir(typeDir);
      const entries = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(typeDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          entries.push(JSON.parse(content));
        }
      }

      return entries;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async shutdown() {
  }
}
