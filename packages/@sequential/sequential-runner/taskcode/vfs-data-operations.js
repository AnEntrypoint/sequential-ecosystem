/**
 * vfs-data-operations.js - VFS file data operations
 *
 * Read, write, delete, stat, and exists operations with scope resolution
 */

import * as fileOps from './vfs-file-operations.js';

export class VFSDataOperations {
  constructor(vfsInstance) {
    this.vfs = vfsInstance;
  }

  async writeFile(filepath, content, scope = 'run', options = {}) {
    try {
      const fullPath = this.vfs._resolvePath(filepath, scope);
      const metadata = await fileOps.writeFile(filepath, content, fullPath, options);
      const event = { ...metadata, scope, fullPath };
      this.vfs.emit('file:write', event);
      this.vfs.logger.logFileWrite(filepath, scope, metadata.size, fullPath);
      return { success: true, path: filepath, scope, size: metadata.size, fullPath };
    } catch (error) {
      throw new Error(`Failed to write file ${filepath}: ${error.message}`);
    }
  }

  async readFile(filepath, scope = 'run', options = {}) {
    const searchScopes = scope === 'auto' ? ['run', 'task', 'global'] : [scope];
    const errors = [];

    for (const s of searchScopes) {
      try {
        const fullPath = this.vfs._resolvePath(filepath, s);
        if (!fileOps.fileExists(fullPath)) {
          errors.push(`Not found in ${s} scope`);
          continue;
        }
        const metadata = await fileOps.readFileContent(fullPath, options);
        const event = { path: filepath, scope: s, fullPath, ...metadata };
        this.vfs.emit('file:read', event);
        this.vfs.logger.logFileRead(filepath, s, metadata.size, fullPath);
        return {
          success: true,
          content: metadata.content,
          path: filepath,
          scope: s,
          size: metadata.size,
          modified: metadata.modified,
          fullPath
        };
      } catch (e) {
        errors.push(`${s}: ${e.message}`);
        if (scope !== 'auto') {
          throw new Error(`Failed to read file ${filepath}: ${e.message}`);
        }
      }
    }
    throw new Error(`File not found: ${filepath}. Searched: ${errors.join(', ')}`);
  }

  async deleteFile(filepath, scope = 'run') {
    try {
      const fullPath = this.vfs._resolvePath(filepath, scope);
      if (!fileOps.fileExists(fullPath)) {
        throw new Error(`File not found: ${filepath}`);
      }
      const metadata = await fileOps.deleteFile(filepath, fullPath);
      const event = { ...metadata, scope, fullPath };
      this.vfs.emit('file:delete', event);
      this.vfs.logger.logFileDelete(filepath, scope, fullPath);
      return { success: true, path: filepath, scope };
    } catch (error) {
      throw new Error(`Failed to delete ${filepath}: ${error.message}`);
    }
  }

  async exists(filepath, scope = 'run') {
    try {
      const fullPath = this.vfs._resolvePath(filepath, scope);
      return fileOps.fileExists(fullPath);
    } catch {
      return false;
    }
  }

  async stat(filepath, scope = 'run') {
    try {
      const fullPath = this.vfs._resolvePath(filepath, scope);
      const metadata = await fileOps.getFileStat(filepath, fullPath);
      return {
        path: metadata.path,
        scope,
        size: metadata.size,
        modified: metadata.modified,
        created: metadata.created,
        accessed: metadata.accessed,
        isDirectory: metadata.isDirectory,
        isFile: metadata.isFile,
        fullPath
      };
    } catch (error) {
      throw new Error(`Failed to stat ${filepath}: ${error.message}`);
    }
  }
}
