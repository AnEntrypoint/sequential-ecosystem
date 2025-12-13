import path from 'path';
import fs from 'fs-extra';
import { BaseRepository } from './base-repository.js';
import {
  ensureDirectory,
  writeFileAtomicJson
} from '@sequentialos/file-operations';

export class AppRepository extends BaseRepository {
  constructor(baseDir = null) {
    super(baseDir || path.join(process.env.ECOSYSTEM_PATH || process.env.HOME, '.sequential', 'apps'), 'App');
  }

  async getManifest(appId) {
    const appDir = this.validatePath(appId);
    const manifestPath = path.join(appDir, 'manifest.json');
    return await this.readJsonFile(manifestPath, 'manifest');
  }

  async saveManifest(appId, manifest) {
    const appDir = this.validatePath(appId);
    await ensureDirectory(appDir);
    const manifestPath = path.join(appDir, 'manifest.json');
    await writeFileAtomicJson(manifestPath, manifest);
  }

  async getFile(appId, filePath) {
    const appDir = this.validatePath(appId);
    const fullPath = path.join(appDir, filePath);
    const realPath = path.resolve(fullPath);
    if (!realPath.startsWith(path.resolve(appDir))) {
      throw this.createError(`Access denied: ${filePath}`, 403, 'FORBIDDEN');
    }
    if (!await fs.pathExists(realPath)) {
      throw this.createError(`File not found: ${filePath}`, 404, 'NOT_FOUND');
    }
    return await fs.readFile(realPath, 'utf8');
  }

  async saveFile(appId, filePath, content) {
    const appDir = this.validatePath(appId);
    const fullPath = path.join(appDir, filePath);
    const realPath = path.resolve(fullPath);
    if (!realPath.startsWith(path.resolve(appDir))) {
      throw this.createError(`Access denied: ${filePath}`, 403, 'FORBIDDEN');
    }
    let fileContent = content;
    if (typeof content !== 'string') {
      fileContent = typeof content === 'object' ? JSON.stringify(content) : String(content);
    }
    await ensureDirectory(path.dirname(realPath));
    await fs.writeFile(realPath, fileContent, 'utf8');
  }

  async deleteFile(appId, filePath) {
    const appDir = this.validatePath(appId);
    const fullPath = path.join(appDir, filePath);
    const realPath = path.resolve(fullPath);
    if (!realPath.startsWith(path.resolve(appDir))) {
      throw this.createError(`Access denied: ${filePath}`, 403, 'FORBIDDEN');
    }
    if (!await fs.pathExists(realPath)) {
      throw this.createError(`File not found: ${filePath}`, 404, 'NOT_FOUND');
    }
    await fs.unlink(realPath);
  }

  async listFiles(appId) {
    const appDir = this.validatePath(appId);
    const files = [];

    const walk = async (dir, relative = '') => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(relative, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath, relPath);
        } else {
          const stat = await fs.stat(fullPath);
          files.push({
            path: relPath.replace(/\\\\/g, '/'),
            size: stat.size,
            modified: stat.mtime.toISOString()
          });
        }
      }
    };

    await walk(appDir);
    return files;
  }

  async deleteApp(appId) {
    const appDir = this.validatePath(appId);
    await fs.remove(appDir);
  }

  async getAll() {
    if (!await fs.pathExists(this.baseDir)) {
      return [];
    }
    const dirs = await fs.readdir(this.baseDir);
    const apps = [];
    for (const dir of dirs) {
      const manifestPath = path.join(this.baseDir, dir, 'manifest.json');
      try {
        const manifest = await this.readJsonFileOptional(manifestPath);
        if (manifest) {
          apps.push({ ...manifest, builtin: false });
        }
      } catch (e) {
        // Invalid manifest, skip
      }
    }
    return apps;
  }

  async create(appId, manifest, initialFiles = {}) {
    const appDir = this.validatePath(appId);
    await ensureDirectory(appDir);

    await this.saveManifest(appId, manifest);

    for (const [filePath, content] of Object.entries(initialFiles)) {
      await this.saveFile(appId, filePath, content);
    }

    return manifest;
  }
}
