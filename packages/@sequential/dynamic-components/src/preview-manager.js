// Preview component management and updates
export class PreviewManager {
  constructor() {
    this.previewComponent = null;
    this.watchers = new Map();
    this.updateQueue = [];
    this.isUpdating = false;
    this.listeners = [];
  }

  registerPreview(componentDef, watchPaths = []) {
    this.previewComponent = JSON.parse(JSON.stringify(componentDef));

    if (watchPaths.length === 0) {
      watchPaths = this.extractAllPaths(componentDef);
    }

    watchPaths.forEach(path => {
      this.watchers.set(path, null);
    });

    return this.previewComponent;
  }

  extractAllPaths(obj, prefix = '') {
    const paths = [];

    if (!obj || typeof obj !== 'object') return paths;

    Object.keys(obj).forEach(key => {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      paths.push(fullPath);

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        paths.push(...this.extractAllPaths(obj[key], fullPath));
      }
    });

    return paths;
  }

  updatePreview(updates) {
    this.updateQueue.push({
      updates,
      timestamp: Date.now()
    });

    if (!this.isUpdating) {
      this.processUpdateQueue();
    }
  }

  processUpdateQueue() {
    if (this.updateQueue.length === 0) {
      this.isUpdating = false;
      return;
    }

    this.isUpdating = true;
    const { updates, timestamp } = this.updateQueue.shift();

    this.applyUpdates(updates);
    this.notifyListeners({
      type: 'update',
      timestamp,
      updates
    });

    setTimeout(() => this.processUpdateQueue(), 16);
  }

  applyUpdates(updates) {
    Object.entries(updates).forEach(([path, value]) => {
      this.setNestedValue(this.previewComponent, path, value);
      this.watchers.set(path, value);
    });
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  getNestedValue(obj, path) {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current == null) return undefined;
      current = current[key];
    }

    return current;
  }

  watchPath(path, callback) {
    const watcher = {
      path,
      callback,
      lastValue: this.getNestedValue(this.previewComponent, path)
    };

    this.watchers.set(`watcher_${path}_${Date.now()}`, watcher);
    return () => this.watchers.delete(`watcher_${path}_${Date.now()}`);
  }

  onUpdate(callback) {
    this.listeners.push(callback);
    return () => {
      const idx = this.listeners.indexOf(callback);
      if (idx > -1) this.listeners.splice(idx, 1);
    };
  }

  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (e) {
        console.error('Preview listener error:', e);
      }
    });
  }

  startLiveReload(updateHandler) {
    const unsubscribe = this.onUpdate((event) => {
      if (event.type === 'update') {
        updateHandler(this.previewComponent, event);
      }
    });

    return unsubscribe;
  }

  exportPreviewState(renderHistory) {
    return {
      component: this.previewComponent,
      history: renderHistory.slice(-50),
      exportedAt: new Date().toISOString()
    };
  }

  captureSnapshot() {
    return {
      component: JSON.parse(JSON.stringify(this.previewComponent)),
      timestamp: Date.now()
    };
  }
}
