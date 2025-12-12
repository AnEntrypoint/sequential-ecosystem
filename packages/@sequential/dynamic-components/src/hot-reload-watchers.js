/**
 * hot-reload-watchers.js - Path watchers and change detection
 *
 * Manage watchers on component paths and detect value changes
 */

export class HotReloadWatchers {
  constructor() {
    this.watchers = new Map();
  }

  watchPath(path, callback) {
    const watcher = {
      path,
      callback,
      lastValue: null,
      debounceTimer: null
    };
    this.watchers.set(path, watcher);
    return () => {
      this.watchers.delete(path);
    };
  }

  checkWatchers(component, getNestedValue) {
    this.watchers.forEach((watcher) => {
      const newValue = getNestedValue(component, watcher.path);

      if (JSON.stringify(newValue) !== JSON.stringify(watcher.lastValue)) {
        watcher.lastValue = newValue;

        try {
          watcher.callback(newValue);
        } catch (e) {
          console.error(`Watcher error for path ${watcher.path}:`, e);
        }
      }
    });
  }

  clear() {
    this.watchers.clear();
  }
}
