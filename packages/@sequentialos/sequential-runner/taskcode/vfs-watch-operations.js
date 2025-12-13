/**
 * vfs-watch-operations.js - VFS file watching operations
 *
 * Watch file changes and emit events
 */

import * as fileOps from './vfs-file-operations.js';

export class VFSWatchOperations {
  constructor(vfsInstance) {
    this.vfs = vfsInstance;
  }

  watch(filepath, scope = 'run', callback) {
    try {
      const fullPath = this.vfs._resolvePath(filepath, scope);
      if (!fileOps.fileExists(fullPath)) {
        throw new Error(`Cannot watch non-existent path: ${filepath}`);
      }
      this.vfs.logger.logWatcher(filepath, scope, fullPath);
      const watcher = fileOps.watchFile(filepath, fullPath, (event) => {
        this.vfs.logger.logFileChange(filepath, scope, event.event, event.filename);
        callback({ ...event, scope });
      });
      return {
        close: () => {
          watcher.close();
          this.vfs.logger.logWatcherClosed(filepath, scope);
        }
      };
    } catch (error) {
      throw new Error(`Failed to watch ${filepath}: ${error.message}`);
    }
  }
}
