/**
 * metrics-analysis.js - Metrics analysis operations
 *
 * Analyze flows, states, errors, and services
 */

export class MetricsAnalysis {
  constructor(storage) {
    this.flows = storage.flows;
    this.states = storage.states;
    this.errors = storage.errors;
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
}
