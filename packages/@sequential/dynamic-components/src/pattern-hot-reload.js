/**
 * Pattern Hot Reload Facade
 * Coordinates hot reload functionality with 100% backward compatibility
 *
 * Delegates to:
 * - HotReloadCore: Component rendering and change application
 * - HotReloadHistory: State history and undo/redo
 * - HotReloadUI: Preview UI and panel builders
 * - HotReloadProcessor: Change queue processing and metrics
 * - HotReloadEvents: Event listener management
 * - HotReloadStateCoordinator: State operations coordination
 */

import { HotReloadCore } from './hot-reload-core.js';
import { HotReloadHistory } from './hot-reload-history.js';
import { HotReloadUI } from './hot-reload-ui.js';
import { HotReloadProcessor } from './hot-reload-processor.js';
import { HotReloadEvents } from './hot-reload-events.js';
import { HotReloadStateCoordinator } from './hot-reload-state-coordinator.js';

class PatternHotReload {
  constructor(renderer, options = {}) {
    this.core = new HotReloadCore(renderer, options);
    this.history = new HotReloadHistory(options);
    this.ui = new HotReloadUI();
    this.processor = new HotReloadProcessor(this.core, this.history);
    this.events = new HotReloadEvents();
    this.state = new HotReloadStateCoordinator(this.core, this.history);
    this.processor.debugMode = options.debug || false;
  }

  // Core initialization
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

  // Change processing - delegate to processor
  processChanges() {
    const result = this.processor.process();
    if (result) {
      this.events.execute('change', { changes: result.changes, component: this.core.currentComponent });
    }
  }

  // History operations - delegate to state coordinator
  undo(steps = 1) {
    const result = this.state.undo(steps);
    if (result.success) {
      this.events.execute('undo', { steps, component: this.core.currentComponent });
      return true;
    }
    return false;
  }

  redo(steps = 1) {
    const result = this.state.redo(steps);
    if (result.success) {
      this.events.execute('redo', { steps, component: this.core.currentComponent });
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
    const result = this.state.jumpToHistory(index);
    if (result.success) {
      this.events.execute('jump', { index, component: this.core.currentComponent });
      return true;
    }
    return false;
  }

  // UI building - delegate to ui
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

  // Event management - delegate to events
  on(event, callback) {
    return this.events.on(event, callback);
  }

  off(event, callback) {
    return this.events.off(event, callback);
  }

  // Metrics and state
  getMetrics() {
    return this.history.getMetrics();
  }

  clearHistory() {
    this.history.clearHistory();
    return this;
  }

  exportState() {
    return this.state.exportState();
  }

  importState(state) {
    this.state.importState(state);
    return this;
  }

  dispose() {
    this.core.dispose();
    this.history.clearHistory();
    this.events.clear();
  }
}

function createPatternHotReload(renderer, options = {}) {
  return new PatternHotReload(renderer, options);
}

export { PatternHotReload, createPatternHotReload };
