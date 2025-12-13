/**
 * Performance Query Engine
 * Queries performance metrics for analysis and reporting
 */

export function createQueryEngine(recorder, calculator) {
  return {
    getSlowExecutions(thresholdMs = 1000) {
      const allExecs = recorder.getAllExecutions();
      const slow = [];

      for (const { name, executions } of allExecs) {
        const slowExecs = executions.filter(e => e.duration >= thresholdMs);
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
      const allExecs = recorder.getAllExecutions();
      const failed = [];

      for (const { name, executions } of allExecs) {
        const failedExecs = executions.filter(e => !e.success);
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

    getAllStats() {
      const allExecs = recorder.getAllExecutions();
      const results = [];

      for (const { name, executions } of allExecs) {
        const stats = calculator.calculateStats(executions);
        if (stats) {
          results.push({ name, ...stats });
        }
      }

      return results.sort((a, b) => b.avg - a.avg);
    },

    getSummary() {
      const allStats = this.getAllStats();
      return calculator.calculateSummary(allStats);
    }
  };
}
