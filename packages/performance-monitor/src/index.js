export class PerformanceMonitor {
  constructor(config = {}) {
    this.maxMetrics = config.maxMetrics || 10000;
    this.metrics = [];
    this.sessions = new Map();
    this.alerts = [];
    this.thresholds = {
      taskDuration: config.taskThreshold || 5000,
      toolDuration: config.toolThreshold || 30000,
      llmLatency: config.llmLatency || 500,
      memoryUsage: config.memoryUsage || 100
    };
  }

  recordMetric(metricType, name, duration, metadata = {}) {
    const metric = {
      type: metricType,
      name,
      duration,
      metadata,
      timestamp: nowISO(),
      memory: process.memoryUsage().heapUsed / 1024 / 1024
    };

    this.metrics.push(metric);

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    this.checkThresholds(metric);
    return metric;
  }

  checkThresholds(metric) {
    if (metric.type === 'task' && metric.duration > this.thresholds.taskDuration) {
      this.addAlert({
        level: 'warning',
        type: 'slow-task',
        message: `Task ${metric.name} took ${metric.duration}ms`,
        metric
      });
    }

    if (metric.type === 'tool' && metric.duration > this.thresholds.toolDuration) {
      this.addAlert({
        level: 'warning',
        type: 'slow-tool',
        message: `Tool ${metric.name} took ${metric.duration}ms`,
        metric
      });
    }

    if (metric.memory > this.thresholds.memoryUsage) {
      this.addAlert({
        level: 'warning',
        type: 'high-memory',
        message: `Memory usage at ${metric.memory.toFixed(2)}MB`,
        metric
      });
    }
  }

  startSession(sessionId) {
    this.sessions.set(sessionId, {
      id: sessionId,
      startTime: Date.now(),
      metrics: [],
      events: []
    });
  }

  endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;
    return session;
  }

  recordEvent(sessionId, eventType, data) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.events.push({
      type: eventType,
      data,
      timestamp: nowISO()
    });
  }

  addAlert(alert) {
    this.alerts.push({
      ...alert,
      timestamp: nowISO()
    });

    if (this.alerts.length > 1000) {
      this.alerts.shift();
    }
  }

  getMetrics(filter = {}) {
    return this.metrics.filter(m => {
      if (filter.type && m.type !== filter.type) return false;
      if (filter.name && m.name !== filter.name) return false;
      if (filter.since) {
        const sinceTime = new Date(filter.since).getTime();
        const metricTime = new Date(m.timestamp).getTime();
        if (metricTime < sinceTime) return false;
      }
      return true;
    });
  }

  getStats(metricType) {
    const metrics = this.getMetrics({ type: metricType });
    if (metrics.length === 0) return null;

    const durations = metrics.map(m => m.duration);
    const sorted = [...durations].sort((a, b) => a - b);

    return {
      count: metrics.length,
      total: durations.reduce((a, b) => a + b, 0),
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  getAggregatedStats() {
    const types = ['task', 'tool', 'flow', 'llm'];
    const stats = {};

    for (const type of types) {
      stats[type] = this.getStats(type);
    }

    return stats;
  }

  getAlerts(filter = {}) {
    return this.alerts.filter(a => {
      if (filter.level && a.level !== filter.level) return false;
      if (filter.type && a.type !== filter.type) return false;
      return true;
    });
  }

  clearAlerts() {
    this.alerts = [];
  }

  clearMetrics() {
    this.metrics = [];
  }

  exportMetrics(format = 'json') {
    if (format === 'json') {
      return JSON.stringify({
        metrics: this.metrics,
        stats: this.getAggregatedStats(),
        alerts: this.alerts,
        timestamp: nowISO()
      }, null, 2);
    }

    if (format === 'csv') {
      const headers = ['timestamp', 'type', 'name', 'duration', 'memory'];
      const rows = this.metrics.map(m =>
        [m.timestamp, m.type, m.name, m.duration, m.memory.toFixed(2)].join(',')
      );
      return [headers.join(','), ...rows].join('\n');
    }

    throw new Error(`Unknown format: ${format}`);
  }
}

export function createPerformanceMonitor(config) {
  return new PerformanceMonitor(config);
}
