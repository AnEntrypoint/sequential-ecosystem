/**
 * renderer-performance.js - Renderer Performance Facade
 *
 * Delegates to focused modules:
 * - tree-analyzer: Component tree analysis and traversal
 * - optimizer-operations: Memoization and batching
 * - metrics-tracker: Performance metrics collection
 */

import { TreeAnalyzer } from './tree-analyzer.js';
import { OptimizerOperations } from './optimizer-operations.js';
import { MetricsTracker } from './metrics-tracker.js';

class RendererPerformanceOptimizer {
  constructor() {
    this.renderThreshold = 1000;
    this.batchSize = 100;
    this.useVirtualization = true;

    this.treeAnalyzer = new TreeAnalyzer(this.renderThreshold);
    this.optimizer = new OptimizerOperations(this.batchSize);
    this.metricsTracker = new MetricsTracker();
  }

  analyzeComponentTree(componentDef) {
    return this.treeAnalyzer.analyzeComponentTree.call(this.treeAnalyzer, componentDef);
  }

  optimizeForRendering(componentDef) {
    return this.optimizer.optimizeForRendering.call(this.optimizer, componentDef);
  }

  enableVirtualization(enabled = true) {
    this.useVirtualization = enabled;
  }

  enableMemoization(enabled = true) {
    this.optimizer.enableMemoization.call(this.optimizer, enabled);
  }

  setThresholds(renderThreshold, batchSize) {
    this.renderThreshold = renderThreshold;
    this.treeAnalyzer = new TreeAnalyzer(renderThreshold);
    this.optimizer.setThresholds.call(this.optimizer, renderThreshold, batchSize);
  }

  startMetrics(componentId) {
    this.metricsTracker.startMetrics.call(this.metricsTracker, componentId);
  }

  endMetrics(componentId) {
    return this.metricsTracker.endMetrics.call(this.metricsTracker, componentId);
  }

  getMetrics(componentId) {
    return this.metricsTracker.getMetrics.call(this.metricsTracker, componentId);
  }

  getAllMetrics() {
    return this.metricsTracker.getAllMetrics.call(this.metricsTracker);
  }

  getSlowComponents(threshold) {
    return this.metricsTracker.getSlowComponents.call(this.metricsTracker, threshold);
  }

  clearMetrics() {
    this.metricsTracker.clearMetrics.call(this.metricsTracker);
  }

  generateReport() {
    return this.metricsTracker.generateReport.call(this.metricsTracker);
  }
}

function createRendererPerformanceOptimizer() {
  return new RendererPerformanceOptimizer();
}

export { RendererPerformanceOptimizer, createRendererPerformanceOptimizer };
