// Facade maintaining 100% backward compatibility
import { PreviewManager } from './preview-manager.js';
import { PreviewMetrics } from './preview-metrics.js';
import { PreviewUI } from './preview-ui.js';

class PatternPreview {
  constructor() {
    this.manager = new PreviewManager();
    this.metrics = new PreviewMetrics();
    this.ui = new PreviewUI();
    this.previewComponent = this.manager.previewComponent;
    this.watchers = this.manager.watchers;
  }

  registerPreview(componentDef, watchPaths = []) {
    return this.manager.registerPreview(componentDef, watchPaths);
  }

  extractAllPaths(obj, prefix = '') {
    return this.manager.extractAllPaths(obj, prefix);
  }

  updatePreview(updates) {
    return this.manager.updatePreview(updates);
  }

  applyUpdates(updates) {
    return this.manager.applyUpdates(updates);
  }

  setNestedValue(obj, path, value) {
    return this.manager.setNestedValue(obj, path, value);
  }

  getNestedValue(obj, path) {
    return this.manager.getNestedValue(obj, path);
  }

  watchPath(path, callback) {
    return this.manager.watchPath(path, callback);
  }

  onUpdate(callback) {
    return this.manager.onUpdate(callback);
  }

  notifyListeners(event) {
    return this.manager.notifyListeners(event);
  }

  trackRender() {
    return this.metrics.trackRender();
  }

  getAverageFrameTime() {
    return this.metrics.getAverageFrameTime();
  }

  getPerformanceMetrics() {
    return this.metrics.getPerformanceMetrics();
  }

  buildPreviewPanel() {
    return this.ui.buildPreviewPanel(this.manager.previewComponent, this.metrics.getPerformanceMetrics());
  }

  buildPreviewContainer() {
    return this.ui.buildPreviewContainer(this.manager.previewComponent);
  }

  buildPerformancePanel() {
    return this.ui.buildPerformancePanel(this.metrics.getPerformanceMetrics());
  }

  buildMetricCard(label, value, color) {
    return this.ui.buildMetricCard(label, value, color);
  }

  startLiveReload(updateHandler) {
    return this.manager.startLiveReload(updateHandler);
  }

  exportPreviewState() {
    const state = this.manager.exportPreviewState(this.metrics.renderHistory);
    state.metrics = this.metrics.getPerformanceMetrics();
    return state;
  }

  compareSnapshots(snapshot1, snapshot2) {
    const changes = [];

    const findDifferences = (obj1, obj2, path = '') => {
      const keys = new Set([
        ...Object.keys(obj1 || {}),
        ...Object.keys(obj2 || {})
      ]);

      keys.forEach(key => {
        const fullPath = path ? `${path}.${key}` : key;
        const val1 = obj1?.[key];
        const val2 = obj2?.[key];

        if (JSON.stringify(val1) !== JSON.stringify(val2)) {
          changes.push({
            path: fullPath,
            from: val1,
            to: val2
          });

          if (typeof val1 === 'object' && typeof val2 === 'object') {
            findDifferences(val1, val2, fullPath);
          }
        }
      });
    };

    findDifferences(snapshot1.component, snapshot2.component);
    return changes;
  }

  buildComparisonUI(snapshot1, snapshot2) {
    const changes = this.compareSnapshots(snapshot1, snapshot2);
    return this.ui.buildComparisonUI(changes);
  }

  captureSnapshot() {
    const snapshot = this.manager.captureSnapshot();
    snapshot.metrics = this.metrics.getPerformanceMetrics();
    return snapshot;
  }

  resetMetrics() {
    return this.metrics.resetMetrics();
  }
}

function createPatternPreview() {
  return new PatternPreview();
}

export { PatternPreview, createPatternPreview };
