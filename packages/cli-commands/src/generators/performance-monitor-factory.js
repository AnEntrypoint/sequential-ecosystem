/**
 * Performance Monitor Factory
 * Creates performance monitors for tracking execution metrics
 */

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
