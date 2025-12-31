import chokidar from 'chokidar';
import EventEmitter from 'eventemitter3';
import logger from '@sequentialos/sequential-logging';

export class FileWatcher extends EventEmitter {
  constructor(paths = [], options = {}) {
    super();
    this.paths = paths;
    this.watcher = null;
    this.debounceMs = options.debounceMs || 300;
    this.timers = new Map();
    this.ignorePattern = options.ignorePattern || ['**/node_modules/**', '**/.git/**', '**/runs/**'];
  }

  start() {
    if (this.watcher) {
      logger.warn('[FileWatcher] Already started');
      return;
    }

    this.watcher = chokidar.watch(this.paths, {
      ignoreInitial: true,
      persistent: true,
      ignored: this.ignorePattern,
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100
      }
    });

    this.watcher
      .on('add', path => this._debounceEmit('file:added', path))
      .on('change', path => this._debounceEmit('file:changed', path))
      .on('unlink', path => this._debounceEmit('file:deleted', path))
      .on('ready', () => logger.info(`[FileWatcher] Ready, watching ${this.paths.length} paths`))
      .on('error', (err) => logger.error('[FileWatcher] Error:', err));

    logger.info(`[FileWatcher] Starting to watch: ${this.paths.join(', ')}`);
  }

  _debounceEmit(event, path) {
    const key = `${event}:${path}`;
    const existingTimer = this.timers.get(key);

    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.emit(event, path);
      this.timers.delete(key);
      logger.debug(`[FileWatcher] Emitted: ${event} ${path}`);
    }, this.debounceMs);

    this.timers.set(key, timer);
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
      logger.info('[FileWatcher] Stopped');
    }

    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  isWatching() {
    return !!this.watcher;
  }

  add(paths) {
    if (this.watcher) {
      this.watcher.add(paths);
      logger.debug(`[FileWatcher] Added paths: ${paths}`);
    }
  }

  unwatch(paths) {
    if (this.watcher) {
      this.watcher.unwatch(paths);
      logger.debug(`[FileWatcher] Unwatching paths: ${paths}`);
    }
  }
}

export function createFileWatcher(paths, options) {
  return new FileWatcher(paths, options);
}
