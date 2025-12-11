/**
 * metrics-tracker.js
 *
 * Performance metrics collection and analysis
 */

export class MetricsTracker {
  constructor() {
    this.metrics = new Map();
  }

  startMetrics(componentId) {
    this.metrics.set(componentId, {
      startTime: performance.now(),
      children: []
    });
  }

  endMetrics(componentId) {
    const metric = this.metrics.get(componentId);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      return metric;
    }
    return null;
  }

  getMetrics(componentId) {
    return this.metrics.get(componentId);
  }

  getAllMetrics() {
    return Array.from(this.metrics.values()).sort((a, b) => b.duration - a.duration);
  }

  getSlowComponents(threshold = 16.67) {
    return this.getAllMetrics().filter(m => m.duration > threshold);
  }

  clearMetrics() {
    this.metrics.clear();
  }

  generateReport() {
    const allMetrics = this.getAllMetrics();
    const totalDuration = allMetrics.reduce((sum, m) => sum + m.duration, 0);
    const avgDuration = totalDuration / allMetrics.length;
    const slowest = allMetrics.slice(0, 5);

    return {
      totalComponents: allMetrics.length,
      totalDuration,
      avgDuration,
      slowestComponents: slowest,
      targetFrameTime: 16.67,
      framesDropped: allMetrics.filter(m => m.duration > 16.67).length
    };
  }
}
