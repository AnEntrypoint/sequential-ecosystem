export class FlowMetricsCollector {
  constructor() {
    this.flows = [];
    this.states = [];
    this.errors = [];
    this.window = 60000;
  }

  recordFlowExecution(flowId, duration, stateCount, success, errors = []) {
    this.flows.push({
      flowId,
      duration,
      stateCount,
      success,
      errors,
      timestamp: Date.now()
    });
  }

  recordStateMetric(flowId, stateId, enteredAt, exitedAt) {
    this.states.push({
      flowId,
      stateId,
      duration: exitedAt - enteredAt,
      timestamp: exitedAt
    });
  }

  recordError(errorType, state, recovery) {
    this.errors.push({
      type: errorType,
      state,
      recovery,
      timestamp: Date.now()
    });
  }

  getExecutionMetrics() {
    if (this.flows.length === 0) {
      return { totalFlows: 0, successRate: 0, avgDuration: 0, totalErrors: 0 };
    }

    const successCount = this.flows.filter(f => f.success).length;
    const totalErrors = this.flows.reduce((sum, f) => sum + f.errors.length, 0);
    const avgDuration = this.flows.reduce((sum, f) => sum + f.duration, 0) / this.flows.length;

    return {
      totalFlows: this.flows.length,
      successRate: (successCount / this.flows.length) * 100,
      avgDuration,
      totalErrors
    };
  }

  getStateAnalysis() {
    const analysis = {};
    this.states.forEach(s => {
      if (!analysis[s.stateId]) {
        analysis[s.stateId] = { count: 0, totalDuration: 0, avgDuration: 0 };
      }
      analysis[s.stateId].count += 1;
      analysis[s.stateId].totalDuration += s.duration;
      analysis[s.stateId].avgDuration = analysis[s.stateId].totalDuration / analysis[s.stateId].count;
    });
    return analysis;
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

  getErrorAnalysis() {
    const totalErrors = this.errors.length;
    const errorDistribution = {};
    const recovered = this.errors.filter(e => e.recovery).length;

    this.errors.forEach(e => {
      errorDistribution[e.type] = (errorDistribution[e.type] || 0) + 1;
    });

    return {
      totalErrors,
      errorDistribution,
      recoveryRate: totalErrors > 0 ? (recovered / totalErrors) * 100 : 0
    };
  }

  getServicePerformance() {
    const serviceMetrics = {};

    this.flows.forEach(f => {
      const parts = f.flowId.split('-');
      const service = parts.slice(0, -1).join('-');

      if (!serviceMetrics[service]) {
        serviceMetrics[service] = {
          totalExecutions: 0,
          successCount: 0,
          errorCount: 0,
          avgDuration: 0,
          totalDuration: 0
        };
      }

      serviceMetrics[service].totalExecutions += 1;
      if (f.success) {
        serviceMetrics[service].successCount += 1;
      } else {
        serviceMetrics[service].errorCount += 1;
      }
      serviceMetrics[service].totalDuration += f.duration;
      serviceMetrics[service].avgDuration = serviceMetrics[service].totalDuration / serviceMetrics[service].totalExecutions;
    });

    return serviceMetrics;
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

  aggregateMetrics() {
    return {
      executions: this.getExecutionMetrics(),
      states: this.getStateAnalysis(),
      throughput: this.getThroughput(),
      percentiles: this.getPercentiles(),
      errors: this.getErrorAnalysis(),
      services: this.getServicePerformance(),
      slowestStates: this.getSlowestStates()
    };
  }

  getSnapshot() {
    return {
      timestamp: Date.now(),
      flowCount: this.flows.length,
      stateCount: this.states.length,
      errorCount: this.errors.length,
      metrics: this.aggregateMetrics()
    };
  }
}

export function createFlowMetricsCollector() {
  return new FlowMetricsCollector();
}
