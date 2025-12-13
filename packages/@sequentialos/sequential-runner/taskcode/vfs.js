/**
 * vfs.js - TaskVFS Facade
 *
 * Delegates to focused modules:
 * - vfs-data-operations: Read, write, delete, stat, exists
 * - vfs-directory-management: Directory listing, creation, tree, export
 * - vfs-watch-operations: File watching with events
 */

import { EventEmitter } from 'events';
import { validator } from '@sequentialos/core-config';
import { resolvePath } from './vfs-path-resolver.js';
import { VFSLogger } from './vfs-logger.js';
import { createScopes, ensureScopeDirectories } from './vfs-scope-manager.js';
import { VFSDataOperations } from './vfs-data-operations.js';
import { VFSDirectoryManagement } from './vfs-directory-management.js';
import { VFSWatchOperations } from './vfs-watch-operations.js';

class TaskVFS extends EventEmitter {
  constructor(ecosystemPath, taskId, runId) {
    super();
    this.ecosystemPath = ecosystemPath;
    this.taskId = taskId;
    this.runId = runId;

    try {
      validator.validate(process.env, false);
      this.debug = validator.get('DEBUG');
    } catch {
      this.debug = process.env.DEBUG === '1';
    }

    this.scopes = createScopes(ecosystemPath, taskId, runId);
    this.logger = new VFSLogger(this.debug);
    this._ensureDirectories();
    this.logger.logInitialized(taskId, runId, this.scopes);

    this.dataOps = new VFSDataOperations(this);
    this.dirMgmt = new VFSDirectoryManagement(this);
    this.watchOps = new VFSWatchOperations(this);
  }

  _ensureDirectories() {
    ensureScopeDirectories(this.scopes).catch(err => {
      this.logger.log('Error ensuring directories', { error: err.message });
    });
  }

  _resolvePath(filepath, scope = 'run') {
    return resolvePath(filepath, this.scopes, scope);
  }

  async writeFile(filepath, content, scope = 'run', options = {}) {
    return this.dataOps.writeFile(filepath, content, scope, options);
  }

  async readFile(filepath, scope = 'run', options = {}) {
    return this.dataOps.readFile(filepath, scope, options);
  }

  async deleteFile(filepath, scope = 'run') {
    return this.dataOps.deleteFile(filepath, scope);
  }

  async exists(filepath, scope = 'run') {
    return this.dataOps.exists(filepath, scope);
  }

  async stat(filepath, scope = 'run') {
    return this.dataOps.stat(filepath, scope);
  }

  async listFiles(dirpath = '/', scope = 'run', options = {}) {
    return this.dirMgmt.listFiles(dirpath, scope, options);
  }

  async mkdir(dirpath, scope = 'run') {
    return this.dirMgmt.mkdir(dirpath, scope);
  }

  getVFSTree() {
    return this.dirMgmt.getVFSTree();
  }

  async exportToOSjs(osJsVFSPath) {
    return this.dirMgmt.exportToOSjs(osJsVFSPath);
  }

  watch(filepath, scope = 'run', callback) {
    return this.watchOps.watch(filepath, scope, callback);
  }
}

export { TaskVFS };
export default { TaskVFS };
