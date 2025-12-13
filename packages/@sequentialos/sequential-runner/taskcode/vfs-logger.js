import logger from '@sequentialos/sequential-logging';

/**
 * VFS logging utilities with debug flag
 */
export class VFSLogger {
  constructor(debug = false) {
    this.debug = debug;
  }

  log(message, data = {}) {
    if (this.debug) {
      logger.info(`[TaskVFS] ${message}`, data);
    }
  }

  logFileWrite(filepath, scope, size, fullPath) {
    this.log('File written', { filepath, scope, size, fullPath });
  }

  logFileRead(filepath, scope, size, fullPath) {
    this.log('File read', { filepath, scope, size, fullPath });
  }

  logFileDelete(filepath, scope, fullPath) {
    this.log('File deleted', { filepath, scope, fullPath });
  }

  logFileChange(filepath, scope, event, filename) {
    this.log('File change detected', { filepath, scope, event, filename });
  }

  logDirectoryCreated(dirpath, scope, fullPath) {
    this.log(`Created scope directory: ${scope}`, { dirpath, fullPath });
  }

  logDirectoryListed(dirpath, scope, fileCount, dirCount) {
    this.log('Listed files', { dirpath, scope, fileCount, dirCount });
  }

  logWatcher(filepath, scope, fullPath) {
    this.log('Watching file', { filepath, scope, fullPath });
  }

  logWatcherClosed(filepath, scope) {
    this.log('Watcher closed', { filepath, scope });
  }

  logExported(exportPath) {
    this.log('Exported to OS.js', { exportPath });
  }

  logInitialized(taskId, runId, scopes) {
    this.log('VFS initialized', { taskId, runId, scopes });
  }
}
