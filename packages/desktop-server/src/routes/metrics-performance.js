/**
 * metrics-performance.js - Performance metrics calculations
 *
 * Calculate throughput, percentiles, slowest states, and aggregations
 */

export class MetricsPerformance {
  constructor(storage) {
    this.flows = storage.flows;
    this.states = storage.states;
    this.window = storage.window || 60000;
  }

  getThroughput(windowMs = 60000) {
    const now = Date.now();
    const recentFlows = this.flows.filter(f => now - f.timestamp < windowMs);
    return (recentFlows.length / (windowMs / 1000)) * 60;
  }

  getPercentiles() {
    if (this.flows.length === 0) {
      return { p50: 0, p95: 0, p99: 0 };
    }

    const sorted = [...this.flows].sort((a, b) => a.duration - b.duration);
    const len = sorted.length;

    const p50 = sorted[Math.floor(len * 0.50)].duration;
    const p95 = sorted[Math.floor(len * 0.95)].duration;
    const p99 = sorted[Math.floor(len * 0.99)].duration;

    return { p50, p95, p99 };
  }

  getSlowestStates() {
    const stateMetrics = {};

    this.states.forEach(s => {
      if (!stateMetrics[s.stateId]) {
        stateMetrics[s.stateId] = [];
      }
      stateMetrics[s.stateId].push(s.duration);
    });

    const avgDurations = Object.entries(stateMetrics).map(([stateId, durations]) => ({
      stateId,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length
    }));

    return avgDurations.sort((a, b) => b.avgDuration - a.avgDuration).slice(0, 5);
  }

  aggregateMetrics(analysis) {
    return {
      executions: analysis.getExecutionMetrics(),
      states: analysis.getStateAnalysis(),
      throughput: this.getThroughput(),
      percentiles: this.getPercentiles(),
      errors: analysis.getErrorAnalysis(),
      services: analysis.getServicePerformance(),
      slowestStates: this.getSlowestStates()
    };
  }

  getSnapshot(analysis) {
    return {
      timestamp: Date.now(),
      flowCount: this.flows.length,
      stateCount: this.states.length,
      errorCount: this.flows.reduce((sum, f) => sum + f.errors.length, 0),
      metrics: this.aggregateMetrics(analysis)
    };
  }
}
