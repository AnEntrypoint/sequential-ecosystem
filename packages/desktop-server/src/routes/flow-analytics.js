/**
 * flow-analytics.js - Flow Metrics Collector Facade
 *
 * Delegates to focused modules:
 * - metrics-recorder: Record flow, state, and error metrics
 * - metrics-analysis: Analyze flows, states, errors, services
 * - metrics-performance: Calculate throughput, percentiles, aggregations
 */

import { MetricsRecorder } from './metrics-recorder.js';
import { MetricsAnalysis } from './metrics-analysis.js';
import { MetricsPerformance } from './metrics-performance.js';

export class FlowMetricsCollector {
  constructor() {
    this.storage = {
      flows: [],
      states: [],
      errors: [],
      window: 60000
    };
    this.recorder = new MetricsRecorder(this.storage);
    this.analysis = new MetricsAnalysis(this.storage);
    this.performance = new MetricsPerformance(this.storage);
  }

  recordFlowExecution(flowId, duration, stateCount, success, errors = []) {
    return this.recorder.recordFlowExecution(flowId, duration, stateCount, success, errors);
  }

  recordStateMetric(flowId, stateId, enteredAt, exitedAt) {
    return this.recorder.recordStateMetric(flowId, stateId, enteredAt, exitedAt);
  }

  recordError(errorType, state, recovery) {
    return this.recorder.recordError(errorType, state, recovery);
  }

  getExecutionMetrics() {
    return this.analysis.getExecutionMetrics();
  }

  getStateAnalysis() {
    return this.analysis.getStateAnalysis();
  }

  getErrorAnalysis() {
    return this.analysis.getErrorAnalysis();
  }

  getServicePerformance() {
    return this.analysis.getServicePerformance();
  }

  getThroughput(windowMs) {
    return this.performance.getThroughput(windowMs);
  }

  getPercentiles() {
    return this.performance.getPercentiles();
  }

  getSlowestStates() {
    return this.performance.getSlowestStates();
  }

  aggregateMetrics() {
    return this.performance.aggregateMetrics(this.analysis);
  }

  getSnapshot() {
    return this.performance.getSnapshot(this.analysis);
  }
}

export function createFlowMetricsCollector() {
  return new FlowMetricsCollector();
}
