import { EventEmitter } from 'events';
import { validator } from '@sequentialos/core-config';
import { resolvePath } from './vfs-path-resolver.js';
import * as fileOps from './vfs-file-operations.js';
import * as dirUtils from './vfs-directory-utilities.js';
import { VFSLogger } from './vfs-logger.js';
import { createScopes, ensureScopeDirectories } from './vfs-scope-manager.js';

/**
 * Facade maintaining 100% backward compatibility with TaskVFS
 */
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
    try {
      const fullPath = this._resolvePath(filepath, scope);
      const metadata = await fileOps.writeFile(filepath, content, fullPath, options);
      const event = { ...metadata, scope, fullPath };
      this.emit('file:write', event);
      this.logger.logFileWrite(filepath, scope, metadata.size, fullPath);
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
        const fullPath = this._resolvePath(filepath, s);
        if (!fileOps.fileExists(fullPath)) {
          errors.push(`Not found in ${s} scope`);
          continue;
        }
        const metadata = await fileOps.readFileContent(fullPath, options);
        const event = { path: filepath, scope: s, fullPath, ...metadata };
        this.emit('file:read', event);
        this.logger.logFileRead(filepath, s, metadata.size, fullPath);
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

  async listFiles(dirpath = '/', scope = 'run', options = {}) {
    try {
      const fullPath = this._resolvePath(dirpath, scope);
      const result = await fileOps.listDirectory(dirpath, fullPath);
      this.logger.logDirectoryListed(dirpath, scope, result.files.length, result.directories.length);
      return { path: dirpath, scope, ...result };
    } catch (error) {
      throw new Error(`Failed to list files in ${dirpath}: ${error.message}`);
    }
  }

  async deleteFile(filepath, scope = 'run') {
    try {
      const fullPath = this._resolvePath(filepath, scope);
      if (!fileOps.fileExists(fullPath)) {
        throw new Error(`File not found: ${filepath}`);
      }
      const metadata = await fileOps.deleteFile(filepath, fullPath);
      const event = { ...metadata, scope, fullPath };
      this.emit('file:delete', event);
      this.logger.logFileDelete(filepath, scope, fullPath);
      return { success: true, path: filepath, scope };
    } catch (error) {
      throw new Error(`Failed to delete ${filepath}: ${error.message}`);
    }
  }

  async exists(filepath, scope = 'run') {
    try {
      const fullPath = this._resolvePath(filepath, scope);
      return fileOps.fileExists(fullPath);
    } catch {
      return false;
    }
  }

  async stat(filepath, scope = 'run') {
    try {
      const fullPath = this._resolvePath(filepath, scope);
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

  async mkdir(dirpath, scope = 'run') {
    try {
      const fullPath = this._resolvePath(dirpath, scope);
      const metadata = await fileOps.createDirectory(dirpath, fullPath);
      this.logger.logDirectoryCreated(dirpath, scope, fullPath);
      return { success: true, path: dirpath, scope, fullPath };
    } catch (error) {
      throw new Error(`Failed to create directory ${dirpath}: ${error.message}`);
    }
  }

  watch(filepath, scope = 'run', callback) {
    try {
      const fullPath = this._resolvePath(filepath, scope);
      if (!fileOps.fileExists(fullPath)) {
        throw new Error(`Cannot watch non-existent path: ${filepath}`);
      }
      this.logger.logWatcher(filepath, scope, fullPath);
      const watcher = fileOps.watchFile(filepath, fullPath, (event) => {
        this.logger.logFileChange(filepath, scope, event.event, event.filename);
        callback({ ...event, scope });
      });
      return {
        close: () => {
          watcher.close();
          this.logger.logWatcherClosed(filepath, scope);
        }
      };
    } catch (error) {
      throw new Error(`Failed to watch ${filepath}: ${error.message}`);
    }
  }

  getVFSTree() {
    return dirUtils.buildVFSTree(this.scopes);
  }

  async exportToOSjs(osJsVFSPath) {
    try {
      const exportPath = await dirUtils.exportToPath(this.scopes, osJsVFSPath, this.taskId);
      this.logger.logExported(exportPath);
      return { success: true, exportPath };
    } catch (error) {
      throw new Error(`Failed to export to OS.js: ${error.message}`);
    }
  }
}

export { TaskVFS };
export default { TaskVFS };
