/**
 * Tool Discovery Core - Metrics Module
 * Tool performance metrics and statistics
 */

export function createMetricsAnalyzer(metricsMap) {
  return {
    getMetrics(toolName) {
      if (!metricsMap.has(toolName)) {
        return null;
      }

      const metric = metricsMap.get(toolName);
      const avgDuration = metric.calls > 0 ? metric.totalDuration / metric.calls : 0;
      const successRate = metric.calls > 0 ? ((metric.successes / metric.calls) * 100).toFixed(1) : 0;

      return {
        toolName,
        calls: metric.calls,
        successes: metric.successes,
        failures: metric.failures,
        successRate: `${successRate}%`,
        averageDuration: Math.round(avgDuration),
        minDuration: metric.minDuration === Infinity ? 0 : metric.minDuration,
        maxDuration: metric.maxDuration,
        lastCalled: metric.lastCalled
      };
    },

    getAllMetrics() {
      const allMetrics = [];

      for (const toolName of metricsMap.keys()) {
        allMetrics.push(this.getMetrics(toolName));
      }

      return allMetrics.sort((a, b) => b.calls - a.calls);
    },

    getSlowTools(threshold = 1000) {
      return this.getAllMetrics().filter(m => m.averageDuration >= threshold);
    },

    getFailingTools() {
      return this.getAllMetrics().filter(m => m.failures > 0);
    },

    getToolStats(toolsSize) {
      const allMetrics = this.getAllMetrics();
      const totalCalls = allMetrics.reduce((sum, m) => sum + m.calls, 0);
      const totalFailures = allMetrics.reduce((sum, m) => sum + m.failures, 0);

      return {
        totalTools: toolsSize,
        totalCalls,
        totalFailures,
        overallSuccessRate: totalCalls > 0 ? (((totalCalls - totalFailures) / totalCalls) * 100).toFixed(1) : 0,
        averageDuration: allMetrics.length > 0
          ? Math.round(allMetrics.reduce((sum, m) => sum + m.averageDuration, 0) / allMetrics.length)
          : 0,
        slowestTool: allMetrics[0] || null,
        fastestTool: allMetrics[allMetrics.length - 1] || null
      };
    },

    resetMetrics(toolName) {
      if (toolName) {
        metricsMap.set(toolName, {
          calls: 0,
          successes: 0,
          failures: 0,
          totalDuration: 0,
          minDuration: Infinity,
          maxDuration: 0,
          lastCalled: null
        });
      } else {
        for (const key of metricsMap.keys()) {
          metricsMap.set(key, {
            calls: 0,
            successes: 0,
            failures: 0,
            totalDuration: 0,
            minDuration: Infinity,
            maxDuration: 0,
            lastCalled: null
          });
        }
      }
    }
  };
}
