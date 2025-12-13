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
