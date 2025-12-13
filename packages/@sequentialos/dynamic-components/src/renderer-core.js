// Core renderer state and initialization
export class RendererCore {
  constructor(options = {}) {
    this.rootElement = null;
    this.components = new Map();
    this.renderers = new Map();
    this.cache = new Map();
    this.hooks = new Map();
    this.state = new Map();
    this.errorBoundary = options.errorBoundary || true;
    this.debug = options.debug || false;
    this.performanceTracking = options.performanceTracking || false;
    this.metrics = {
      renders: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalTime: 0,
      renderTimes: []
    };
  }

  clearCache() {
    this.cache.clear();
  }

  setState(key, value) {
    this.state.set(key, value);
  }

  getState(key) {
    return this.state.get(key);
  }

  getMetrics() {
    return {
      ...this.metrics,
      averageRenderTime: this.metrics.renders > 0 ? this.metrics.totalTime / this.metrics.renders : 0,
      cacheHitRate: this.metrics.cacheHits + this.metrics.cacheMisses > 0
        ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }

  dispose() {
    this.clearCache();
    this.hooks.clear();
    this.renderers.clear();
    this.state.clear();
  }
}
