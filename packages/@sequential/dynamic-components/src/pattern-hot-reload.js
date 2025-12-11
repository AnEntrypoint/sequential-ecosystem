// Facade maintaining 100% backward compatibility
import { HotReloadCore } from './hot-reload-core.js';
import { HotReloadHistory } from './hot-reload-history.js';
import { HotReloadUI } from './hot-reload-ui.js';

class PatternHotReload {
  constructor(renderer, options = {}) {
    this.core = new HotReloadCore(renderer, options);
    this.history = new HotReloadHistory(options);
    this.ui = new HotReloadUI();
    this.listeners = [];
    this.debugMode = options.debug || false;
  }

  init(previewContainer) {
    this.core.init(previewContainer);
    return this;
  }

  watchPath(path, callback) {
    return this.core.watchPath(path, callback);
  }

  setComponent(componentDef) {
    this.core.setComponent(componentDef);
    return this;
  }

  updateComponent(updates) {
    this.core.updateComponent(updates);
    return this;
  }

  processChanges() {
    if (this.core.isProcessing || this.core.changeQueue.length === 0) return;

    this.core.isProcessing = true;
    const startTime = performance.now();

    try {
      const changes = this.core.changeQueue.splice(0);

      changes.forEach(change => {
        this.core.applyChanges(this.core.currentComponent, change.updates);
      });

      this.history.recordChange(changes, this.core.currentComponent);
      this.core.render();
      this.executeListeners('change', { changes, component: this.core.currentComponent });

      const endTime = performance.now();
      this.history.recordMetrics(startTime, endTime);

      if (this.debugMode) {
        console.log(`[Hot Reload] Processed ${changes.length} change(s) in ${(endTime - startTime).toFixed(2)}ms`);
      }
    } finally {
      this.core.isProcessing = false;

      if (this.core.changeQueue.length > 0) {
        this.core.debounceRender();
      }
    }
  }

  undo(steps = 1) {
    const result = this.history.undo(steps);
    if (result.success) {
      this.core.currentComponent = result.snapshot;
      this.core.render();
      this.executeListeners('undo', { steps, component: this.core.currentComponent });
      return true;
    }
    return false;
  }

  redo(steps = 1) {
    const result = this.history.redo(steps);
    if (result.success) {
      this.core.currentComponent = result.snapshot;
      this.core.render();
      this.executeListeners('redo', { steps, component: this.core.currentComponent });
      return true;
    }
    return false;
  }

  canUndo() {
    return this.history.canUndo();
  }

  canRedo() {
    return this.history.canRedo();
  }

  getHistory() {
    return this.history.getHistory();
  }

  jumpToHistory(index) {
    const result = this.history.jumpToHistory(index);
    if (result.success) {
      this.core.currentComponent = result.snapshot;
      this.core.render();
      this.executeListeners('jump', { index, component: this.core.currentComponent });
      return true;
    }
    return false;
  }

  buildPreviewUI() {
    return this.ui.buildPreviewUI(this.core.currentComponent, this.history.getMetrics());
  }

  buildPreviewHeader() {
    return this.ui.buildPreviewHeader(this.history.getMetrics());
  }

  buildPreviewFooter() {
    return this.ui.buildPreviewFooter(
      this.canUndo(),
      this.canRedo(),
      () => this.undo(),
      () => this.redo(),
      () => this.core.render()
    );
  }

  buildHistoryPanel() {
    return this.ui.buildHistoryPanel(this.getHistory());
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
    return this;
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
    return this;
  }

  executeListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Listener error for event ${event}:`, e);
        }
      });
  }

  getMetrics() {
    return this.history.getMetrics();
  }

  clearHistory() {
    this.history.clearHistory();
    return this;
  }

  exportState() {
    return this.history.exportState(this.core.currentComponent);
  }

  importState(state) {
    const component = this.history.importState(state);
    if (component) {
      this.core.currentComponent = component;
      this.core.render();
    }
    return this;
  }

  dispose() {
    this.core.dispose();
    this.history.clearHistory();
    this.listeners = [];
  }
}

function createPatternHotReload(renderer, options = {}) {
  return new PatternHotReload(renderer, options);
}

export { PatternHotReload, createPatternHotReload };
