// Performance optimizer facade - maintains 100% backward compatibility
import { PerfCacheManager } from './perf-cache-manager.js';
import { PerfVirtualScroll } from './perf-virtual-scroll.js';
import { PerfRenderScheduler } from './perf-render-scheduler.js';
import { PerfMetricsAnalyzer } from './perf-metrics-analyzer.js';
import { PerfComplexityAnalyzer } from './perf-complexity-analyzer.js';
import { PerfUIBuilder } from './perf-ui-builder.js';

class PerformanceOptimizer {
  constructor() {
    this.cache = new PerfCacheManager(500);
    this.virtualScroll = new PerfVirtualScroll();
    this.scheduler = new PerfRenderScheduler();
    this.analyzer = new PerfMetricsAnalyzer(1000, 16);
    this.complexity = new PerfComplexityAnalyzer();
    this.ui = new PerfUIBuilder();

    // Expose for backward compatibility
    this.renderMetrics = this.analyzer.renderMetrics;
    this.virtualScrollRegions = this.virtualScroll.virtualScrollRegions;
    this.listeners = this.analyzer.listeners;
    this.maxCacheSize = this.cache.maxCacheSize;
    this.maxMetrics = this.analyzer.maxMetrics;
    this.enableVirtualization = true;
    this.renderBudget = this.analyzer.renderBudget;
  }

  memoizeRender(key, componentDef, renderFn) {
    const result = this.cache.memoizeRender(key, componentDef, renderFn);
    const duration = this.cache.getDuration(key);
    if (duration) {
      this.analyzer.recordMetric('render', key, duration);
    }
    return result;
  }

  setupVirtualScrolling(elementId, items, itemHeight, containerHeight) {
    return this.virtualScroll.setupVirtualScrolling(elementId, items, itemHeight, containerHeight);
  }

  updateScroll(elementId, scrollTop) {
    return this.virtualScroll.updateScroll(elementId, scrollTop);
  }

  getVisibleItems(elementId) {
    return this.virtualScroll.getVisibleItems(elementId);
  }

  debounceRender(fn, delay = 16) {
    return this.scheduler.debounceRender(fn, delay);
  }

  requestAnimationFrameRender(fn) {
    return this.scheduler.requestAnimationFrameRender(fn);
  }

  recordMetric(type, key, duration) {
    this.analyzer.recordMetric(type, key, duration);
  }

  getMetrics(since = null) {
    return this.analyzer.getMetrics(since);
  }

  identifyBottlenecks() {
    return this.analyzer.identifyBottlenecks();
  }

  getOptimizationScore() {
    return this.analyzer.getOptimizationScore();
  }

  analyzeComponentComplexity(definition) {
    return this.complexity.analyzeComponentComplexity(definition);
  }

  buildPerformanceReport() {
    return this.ui.buildPerformanceReport(this.analyzer);
  }

  buildPerformanceUI() {
    return this.ui.buildPerformanceUI(this.analyzer);
  }

  clearMetrics() {
    this.analyzer.clear();
    return this;
  }

  clearCache() {
    this.cache.clear();
    return this;
  }

  on(event, callback) {
    this.analyzer.on(event, callback);
    return this;
  }

  off(event, callback) {
    this.analyzer.off(event, callback);
    return this;
  }

  clear() {
    this.cache.clear();
    this.analyzer.clear();
    this.virtualScroll.clear();
    this.analyzer.listeners = [];
    return this;
  }
}

function createPerformanceOptimizer() {
  return new PerformanceOptimizer();
}

export { PerformanceOptimizer, createPerformanceOptimizer };
