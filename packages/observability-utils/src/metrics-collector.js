export class MetricsCollector {
  constructor(maxMetrics = 10000) {
    this.metrics = [];
    this.maxMetrics = maxMetrics;
    this.summary = {
      totalRequests: 0,
      totalErrors: 0,
      avgResponseTime: 0,
      slowestEndpoint: null
    };
  }

  recordRequest(path, method, statusCode, duration, error = null) {
    const metric = {
      timestamp: Date.now(),
      path,
      method,
      statusCode,
      duration,
      error: error ? error.message : null,
      slow: duration > 1000
    };

    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    this._updateSummary(metric);
    return metric;
  }

  _updateSummary(metric) {
    this.summary.totalRequests++;
    if (metric.error || metric.statusCode >= 400) {
      this.summary.totalErrors++;
    }

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    this.summary.avgResponseTime = Math.round(totalDuration / this.metrics.length);

    const slowest = this.metrics.reduce((max, m) =>
      m.duration > max.duration ? m : max, this.metrics[0] || {}
    );
    this.summary.slowestEndpoint = slowest;
  }

  getMetrics(filter = {}) {
    let filtered = this.metrics;

    if (filter.path) {
      filtered = filtered.filter(m => m.path === filter.path);
    }
    if (filter.method) {
      filtered = filtered.filter(m => m.method === filter.method);
    }
    if (filter.slow) {
      filtered = filtered.filter(m => m.slow);
    }
    if (filter.error) {
      filtered = filtered.filter(m => m.error);
    }

    return filtered.slice(-100);
  }

  getSummary() {
    return {
      ...this.summary,
      errorRate: this.summary.totalRequests > 0
        ? ((this.summary.totalErrors / this.summary.totalRequests) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  getSlowEndpoints(limit = 10) {
    return this.metrics
      .filter(m => m.slow)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
      .map(m => ({ path: m.path, duration: m.duration }));
  }

  getTopErrors(limit = 10) {
    const errorMap = new Map();
    this.metrics.filter(m => m.error).forEach(m => {
      const key = `${m.method} ${m.path}`;
      errorMap.set(key, (errorMap.get(key) || 0) + 1);
    });

    return Array.from(errorMap.entries())
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  clear() {
    this.metrics = [];
    this.summary = {
      totalRequests: 0,
      totalErrors: 0,
      avgResponseTime: 0,
      slowestEndpoint: null
    };
  }
}

export function metricsMiddleware(collector) {
  return (req, res, next) => {
    const startTime = Date.now();

    const originalJson = res.json.bind(res);
    res.json = function(data) {
      const duration = Date.now() - startTime;
      collector.recordRequest(req.path, req.method, res.statusCode, duration);
      return originalJson(data);
    };

    res.on('finish', () => {
      if (!res.headersSent) {
        const duration = Date.now() - startTime;
        collector.recordRequest(req.path, req.method, res.statusCode, duration);
      }
    });

    next();
  };
}
