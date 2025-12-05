import { randomUUID } from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';

const correlationIdStorage = new AsyncLocalStorage();

export const correlationMiddleware = (req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || randomUUID();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  correlationIdStorage.run(correlationId, () => {
    next();
  });
};

export const getCorrelationId = () => {
  return correlationIdStorage.getStore();
};

export class MetricsCollector {
  constructor(windowSize = 10000) {
    this.windowSize = windowSize;
    this.requests = [];
    this.summary = {
      totalRequests: 0,
      totalErrors: 0,
      avgResponseTime: 0,
      slowEndpoints: [],
      errorEndpoints: []
    };
  }

  record(method, path, status, duration, error = null) {
    const entry = {
      timestamp: Date.now(),
      method,
      path,
      status,
      duration,
      error
    };

    this.requests.push(entry);
    if (this.requests.length > this.windowSize) {
      this.requests.shift();
    }

    this.updateSummary();
  }

  updateSummary() {
    if (this.requests.length === 0) return;

    this.summary.totalRequests = this.requests.length;
    this.summary.totalErrors = this.requests.filter(r => r.status >= 400).length;

    const totalDuration = this.requests.reduce((sum, r) => sum + r.duration, 0);
    this.summary.avgResponseTime = totalDuration / this.requests.length;

    const endpointMetrics = {};
    this.requests.forEach(req => {
      const key = `${req.method} ${req.path}`;
      if (!endpointMetrics[key]) {
        endpointMetrics[key] = { count: 0, totalDuration: 0, errors: 0 };
      }
      endpointMetrics[key].count++;
      endpointMetrics[key].totalDuration += req.duration;
      if (req.status >= 400) endpointMetrics[key].errors++;
    });

    this.summary.slowEndpoints = Object.entries(endpointMetrics)
      .map(([endpoint, metrics]) => ({
        endpoint,
        avgDuration: metrics.totalDuration / metrics.count,
        count: metrics.count
      }))
      .filter(e => e.avgDuration > 1000)
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);

    this.summary.errorEndpoints = Object.entries(endpointMetrics)
      .map(([endpoint, metrics]) => ({
        endpoint,
        errorCount: metrics.errors,
        errorRate: metrics.errors / metrics.count
      }))
      .filter(e => e.errorCount > 0)
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 10);
  }

  getSummary() {
    return this.summary;
  }

  getRawMetrics() {
    return this.requests;
  }

  reset() {
    this.requests = [];
    this.summary = {
      totalRequests: 0,
      totalErrors: 0,
      avgResponseTime: 0,
      slowEndpoints: [],
      errorEndpoints: []
    };
  }
}

export const metricsMiddleware = (collector) => {
  return (req, res, next) => {
    const start = Date.now();
    const originalJson = res.json;

    res.json = function(data) {
      const duration = Date.now() - start;
      collector.record(req.method, req.path, res.statusCode, duration);
      return originalJson.call(this, data);
    };

    next();
  };
};

export class TraceLogger {
  static info(message, data = {}) {
    const correlationId = getCorrelationId();
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      correlationId,
      level: 'info',
      message,
      data
    }));
  }

  static error(message, data = {}) {
    const correlationId = getCorrelationId();
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      correlationId,
      level: 'error',
      message,
      data
    }));
  }

  static span(name, fn, data = {}) {
    const start = Date.now();
    try {
      const result = fn();
      const duration = Date.now() - start;
      this.info(`Span: ${name}`, { duration, ...data });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`Span: ${name}`, { duration, error: error.message, ...data });
      throw error;
    }
  }

  static async spanAsync(name, fn, data = {}) {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.info(`Span: ${name}`, { duration, ...data });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`Span: ${name}`, { duration, error: error.message, ...data });
      throw error;
    }
  }
}
