/**
 * metrics-recorder.js - Metrics recording operations
 *
 * Record flow, state, and error metrics
 */

export class MetricsRecorder {
  constructor(storage) {
    this.flows = storage.flows || [];
    this.states = storage.states || [];
    this.errors = storage.errors || [];
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
}
