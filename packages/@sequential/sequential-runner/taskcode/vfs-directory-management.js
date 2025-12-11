/**
 * vfs-directory-management.js - VFS directory operations
 *
 * Directory listing, creation, tree building, and export operations
 */

import * as fileOps from './vfs-file-operations.js';
import * as dirUtils from './vfs-directory-utilities.js';

export class VFSDirectoryManagement {
  constructor(vfsInstance) {
    this.vfs = vfsInstance;
  }

  async listFiles(dirpath = '/', scope = 'run', options = {}) {
    try {
      const fullPath = this.vfs._resolvePath(dirpath, scope);
      const result = await fileOps.listDirectory(dirpath, fullPath);
      this.vfs.logger.logDirectoryListed(dirpath, scope, result.files.length, result.directories.length);
      return { path: dirpath, scope, ...result };
    } catch (error) {
      throw new Error(`Failed to list files in ${dirpath}: ${error.message}`);
    }
  }

  async mkdir(dirpath, scope = 'run') {
    try {
      const fullPath = this.vfs._resolvePath(dirpath, scope);
      const metadata = await fileOps.createDirectory(dirpath, fullPath);
      this.vfs.logger.logDirectoryCreated(dirpath, scope, fullPath);
      return { success: true, path: dirpath, scope, fullPath };
    } catch (error) {
      throw new Error(`Failed to create directory ${dirpath}: ${error.message}`);
    }
  }

  getVFSTree() {
    return dirUtils.buildVFSTree(this.vfs.scopes);
  }

  async exportToOSjs(osJsVFSPath) {
    try {
      const exportPath = await dirUtils.exportToPath(this.vfs.scopes, osJsVFSPath, this.vfs.taskId);
      this.vfs.logger.logExported(exportPath);
      return { success: true, exportPath };
    } catch (error) {
      throw new Error(`Failed to export to OS.js: ${error.message}`);
    }
  }
}
