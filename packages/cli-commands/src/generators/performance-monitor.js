export function createPerformanceMonitor() {
  const metrics = new Map();

  return {
    recordExecution(name, durationMs, success = true, metadata = {}) {
      if (!metrics.has(name)) {
        metrics.set(name, { executions: [], stats: null });
      }

      const entry = metrics.get(name);
      entry.executions.push({
        duration: durationMs,
        success,
        timestamp: new Date().toISOString(),
        ...metadata
      });

      this.updateStats(name);
      return { name, duration: durationMs, success };
    },

    updateStats(name) {
      const entry = metrics.get(name);
      const execs = entry.executions;

      if (execs.length === 0) return;

      const durations = execs.map(e => e.duration);
      const sorted = [...durations].sort((a, b) => a - b);
      const successes = execs.filter(e => e.success).length;

      entry.stats = {
        count: execs.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
        avg: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
        median: sorted[Math.floor(sorted.length / 2)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
        successRate: ((successes / execs.length) * 100).toFixed(1),
        failures: execs.length - successes
      };
    },

    getStats(name) {
      const entry = metrics.get(name);
      return entry ? { name, ...entry.stats } : null;
    },

    getAllStats() {
      const results = [];
      for (const [name, entry] of metrics.entries()) {
        if (entry.stats) {
          results.push({ name, ...entry.stats });
        }
      }
      return results.sort((a, b) => b.avg - a.avg);
    },

    getSlowExecutions(thresholdMs = 1000) {
      const slow = [];
      for (const [name, entry] of metrics.entries()) {
        const slowExecs = entry.executions.filter(e => e.duration >= thresholdMs);
        if (slowExecs.length > 0) {
          slow.push({
            name,
            count: slowExecs.length,
            executions: slowExecs
          });
        }
      }
      return slow.sort((a, b) => b.count - a.count);
    },

    getFailedExecutions() {
      const failed = [];
      for (const [name, entry] of metrics.entries()) {
        const failedExecs = entry.executions.filter(e => !e.success);
        if (failedExecs.length > 0) {
          failed.push({
            name,
            count: failedExecs.length,
            executions: failedExecs
          });
        }
      }
      return failed.sort((a, b) => b.count - a.count);
    },

    getSummary() {
      const allStats = this.getAllStats();
      const totalExecs = allStats.reduce((sum, s) => sum + s.count, 0);
      const totalDuration = allStats.reduce((sum, s) => sum + (s.avg * s.count), 0);
      const avgDuration = totalExecs > 0 ? Math.round(totalDuration / totalExecs) : 0;

      return {
        totalExecutions: totalExecs,
        uniqueItems: allStats.length,
        averageDuration: avgDuration,
        slowest: allStats[0] || null,
        fastest: allStats[allStats.length - 1] || null,
        failureRate: allStats.length > 0
          ? ((allStats.reduce((sum, s) => sum + s.failures, 0) / totalExecs) * 100).toFixed(1)
          : 0
      };
    },

    clear() {
      metrics.clear();
    },

    export() {
      const data = {};
      for (const [name, entry] of metrics.entries()) {
        data[name] = {
          stats: entry.stats,
          executionCount: entry.executions.length
        };
      }
      return data;
    }
  };
}

export function generatePerformanceMonitorTemplate() {
  return `/**
 * Performance Monitoring
 *
 * Tracks execution performance for tasks, flows, and tools.
 * Collects metrics: duration, success rate, percentiles.
 */

import { createPerformanceMonitor } from '@sequential/performance-monitor';

const monitor = createPerformanceMonitor();

// Record task execution
export async function myTask(input) {
  const start = Date.now();
  try {
    const result = await processData(input);
    const duration = Date.now() - start;
    monitor.recordExecution('myTask', duration, true);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    monitor.recordExecution('myTask', duration, false, { error: error.message });
    throw error;
  }
}

// Get statistics
export function getPerformanceStats() {
  return {
    summary: monitor.getSummary(),
    all: monitor.getAllStats(),
    slow: monitor.getSlowExecutions(1000),
    failed: monitor.getFailedExecutions()
  };
}

// Export metrics
export function exportMetrics() {
  return monitor.export();
}
`;
}

export function createFlowPerformanceMonitor() {
  const flowMetrics = new Map();

  return {
    recordFlowExecution(flowName, stateMetrics, totalDuration) {
      if (!flowMetrics.has(flowName)) {
        flowMetrics.set(flowName, { executions: [] });
      }

      const entry = flowMetrics.get(flowName);
      entry.executions.push({
        totalDuration,
        stateMetrics,
        timestamp: new Date().toISOString()
      });

      this.updateFlowStats(flowName);
    },

    updateFlowStats(flowName) {
      const entry = flowMetrics.get(flowName);
      const execs = entry.executions;

      if (execs.length === 0) return;

      const durations = execs.map(e => e.totalDuration);
      const sorted = [...durations].sort((a, b) => a - b);

      entry.stats = {
        count: execs.length,
        totalDuration: Math.round(durations.reduce((a, b) => a + b, 0)),
        avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        p95: sorted[Math.floor(sorted.length * 0.95)]
      };

      const stateTimings = new Map();
      for (const exec of execs) {
        for (const [state, duration] of Object.entries(exec.stateMetrics || {})) {
          if (!stateTimings.has(state)) {
            stateTimings.set(state, []);
          }
          stateTimings.get(state).push(duration);
        }
      }

      entry.stateStats = {};
      for (const [state, durations] of stateTimings.entries()) {
        entry.stateStats[state] = {
          count: durations.length,
          avg: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
          min: Math.min(...durations),
          max: Math.max(...durations)
        };
      }
    },

    getFlowStats(flowName) {
      const entry = flowMetrics.get(flowName);
      if (!entry) return null;
      return { flowName, ...entry.stats, stateBreakdown: entry.stateStats };
    },

    getAllFlowStats() {
      const results = [];
      for (const [flowName, entry] of flowMetrics.entries()) {
        if (entry.stats) {
          results.push({
            flowName,
            ...entry.stats,
            stateBreakdown: entry.stateStats
          });
        }
      }
      return results;
    },

    getBottlenecks(flowName) {
      const entry = flowMetrics.get(flowName);
      if (!entry || !entry.stateStats) return [];

      return Object.entries(entry.stateStats)
        .map(([state, stats]) => ({ state, ...stats }))
        .sort((a, b) => b.avg - a.avg);
    },

    clear() {
      flowMetrics.clear();
    }
  };
}
