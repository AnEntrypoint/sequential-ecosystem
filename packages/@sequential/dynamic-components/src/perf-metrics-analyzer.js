// Performance metrics collection and analysis
export class PerfMetricsAnalyzer {
  constructor(maxMetrics = 1000, renderBudget = 16) {
    this.renderMetrics = [];
    this.maxMetrics = maxMetrics;
    this.renderBudget = renderBudget;
    this.listeners = [];
  }

  recordMetric(type, key, duration) {
    const metric = {
      type,
      key,
      duration,
      timestamp: Date.now(),
      iso: new Date().toISOString()
    };

    this.renderMetrics.push(metric);

    if (this.renderMetrics.length > this.maxMetrics) {
      this.renderMetrics.shift();
    }

    if (duration > this.renderBudget) {
      this.notifyListeners('slowRender', { key, duration });
    }
  }

  getMetrics(since = null) {
    let metrics = this.renderMetrics;

    if (since) {
      metrics = metrics.filter(m => m.timestamp > since);
    }

    const types = {};

    metrics.forEach(m => {
      if (!types[m.type]) {
        types[m.type] = [];
      }
      types[m.type].push(m.duration);
    });

    const summary = {};

    Object.entries(types).forEach(([type, durations]) => {
      durations.sort((a, b) => a - b);

      summary[type] = {
        count: durations.length,
        total: durations.reduce((a, b) => a + b, 0),
        average: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: durations[0],
        max: durations[durations.length - 1],
        p50: durations[Math.floor(durations.length / 2)],
        p95: durations[Math.floor(durations.length * 0.95)],
        p99: durations[Math.floor(durations.length * 0.99)]
      };
    });

    return summary;
  }

  identifyBottlenecks() {
    const metrics = this.getMetrics();
    const bottlenecks = [];

    Object.entries(metrics).forEach(([type, stats]) => {
      if (stats.average > this.renderBudget * 1.5) {
        bottlenecks.push({
          type,
          severity: 'high',
          message: `${type} renders averaging ${stats.average.toFixed(2)}ms (budget: ${this.renderBudget}ms)`,
          suggestion: 'Consider memoization, virtualization, or code splitting',
          improvement: stats.average - this.renderBudget
        });
      }

      if (stats.p99 > this.renderBudget * 3) {
        bottlenecks.push({
          type,
          severity: 'medium',
          message: `${type} p99 is ${stats.p99.toFixed(2)}ms`,
          suggestion: 'Occasional slowdowns detected. Profile individual renders.',
          improvement: stats.p99 - this.renderBudget
        });
      }
    });

    return bottlenecks.sort((a, b) => b.improvement - a.improvement);
  }

  getOptimizationScore() {
    const metrics = this.getMetrics();
    let score = 100;

    Object.values(metrics).forEach(stats => {
      const overBudget = Math.max(0, stats.average - this.renderBudget);

      if (overBudget > 0) {
        score -= Math.min(30, (overBudget / this.renderBudget) * 30);
      }
    });

    return Math.max(0, score);
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Listener error for ${event}:`, e);
        }
      });
  }

  clear() {
    this.renderMetrics = [];
  }
}
