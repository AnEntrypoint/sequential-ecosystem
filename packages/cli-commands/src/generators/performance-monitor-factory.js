/**
 * Performance Monitor Factory
 * Orchestrates performance monitoring with metrics recording and analysis
 *
 * Delegates to:
 * - performance-metrics-recorder: Execution metric recording
 * - performance-stats-calculator: Statistical computation
 * - performance-query-engine: Metric queries and analysis
 */

import { createMetricsRecorder } from './performance-metrics-recorder.js';
import { createStatsCalculator } from './performance-stats-calculator.js';
import { createQueryEngine } from './performance-query-engine.js';

export function createPerformanceMonitor() {
  const recorder = createMetricsRecorder();
  const calculator = createStatsCalculator();
  const query = createQueryEngine(recorder, calculator);

  return {
    recordExecution(name, durationMs, success = true, metadata = {}) {
      return recorder.recordExecution(name, durationMs, success, metadata);
    },

    getAllStats() {
      return query.getAllStats();
    },

    getStats(name) {
      const execs = recorder.getExecutions(name);
      if (execs.length === 0) return null;

      const stats = calculator.calculateStats(execs);
      return stats ? { name, ...stats } : null;
    },

    getSlowExecutions(thresholdMs = 1000) {
      return query.getSlowExecutions(thresholdMs);
    },

    getFailedExecutions() {
      return query.getFailedExecutions();
    },

    getSummary() {
      return query.getSummary();
    },

    clear() {
      recorder.clear();
    },

    export() {
      const data = {};
      for (const { name, executions } of recorder.getAllExecutions()) {
        const stats = calculator.calculateStats(executions);
        data[name] = {
          stats,
          executionCount: executions.length
        };
      }
      return data;
    }
  };
}
