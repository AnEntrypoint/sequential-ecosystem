// Preview component management and updates
import { PathExtractor, PathAccessor } from './preview-path-utils.js';
import { PreviewUpdateQueue } from './preview-update-queue.js';

export class PreviewManager {
  constructor() {
    this.previewComponent = null;
    this.watchers = new Map();
    this.listeners = [];
    this.pathExtractor = new PathExtractor();
    this.pathAccessor = new PathAccessor();
    this.updateQueue = new PreviewUpdateQueue(
      (updates) => this.applyUpdates(updates),
      (event) => this.notifyListeners(event)
    );
  }

  registerPreview(componentDef, watchPaths = []) {
    this.previewComponent = JSON.parse(JSON.stringify(componentDef));

    if (watchPaths.length === 0) {
      watchPaths = this.pathExtractor.extractAllPaths(componentDef);
    }

    watchPaths.forEach(path => {
      this.watchers.set(path, null);
    });

    return this.previewComponent;
  }

  extractAllPaths(obj, prefix = '') {
    return this.pathExtractor.extractAllPaths(obj, prefix);
  }

  updatePreview(updates) {
    this.updateQueue.enqueue(updates);
  }

  applyUpdates(updates) {
    Object.entries(updates).forEach(([path, value]) => {
      this.pathAccessor.setNestedValue(this.previewComponent, path, value);
      this.watchers.set(path, value);
    });
  }

  setNestedValue(obj, path, value) {
    return this.pathAccessor.setNestedValue(obj, path, value);
  }

  getNestedValue(obj, path) {
    return this.pathAccessor.getNestedValue(obj, path);
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
