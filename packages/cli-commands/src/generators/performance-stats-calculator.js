/**
 * Performance Stats Calculator
 * Calculates performance statistics from execution data
 */

export function createStatsCalculator() {
  return {
    calculateStats(executions) {
      if (executions.length === 0) return null;

      const durations = executions.map(e => e.duration);
      const sorted = [...durations].sort((a, b) => a - b);
      const successes = executions.filter(e => e.success).length;

      return {
        count: executions.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
        avg: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
        median: sorted[Math.floor(sorted.length / 2)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
        successRate: ((successes / executions.length) * 100).toFixed(1),
        failures: executions.length - successes
      };
    },

    calculateSummary(allStats) {
      if (allStats.length === 0) {
        return {
          totalExecutions: 0,
          uniqueItems: 0,
          averageDuration: 0,
          slowest: null,
          fastest: null,
          failureRate: 0
        };
      }

      const totalExecs = allStats.reduce((sum, s) => sum + s.count, 0);
      const totalDuration = allStats.reduce((sum, s) => sum + (s.avg * s.count), 0);
      const avgDuration = totalExecs > 0 ? Math.round(totalDuration / totalExecs) : 0;

      return {
        totalExecutions: totalExecs,
        uniqueItems: allStats.length,
        averageDuration: avgDuration,
        slowest: allStats[0] || null,
        fastest: allStats[allStats.length - 1] || null,
        failureRate: ((allStats.reduce((sum, s) => sum + s.failures, 0) / totalExecs) * 100).toFixed(1)
      };
    }
  };
}
