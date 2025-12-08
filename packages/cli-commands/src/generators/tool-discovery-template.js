export function createToolMonitor() {
  return {
    monitoredTools: new Map(),

    monitor(toolName, toolFn) {
      this.monitoredTools.set(toolName, {
        fn: toolFn,
        executions: []
      });

      return async (input) => {
        const start = Date.now();
        try {
          const result = await toolFn(input);
          const duration = Date.now() - start;

          this.monitoredTools.get(toolName).executions.push({
            success: true,
            duration,
            timestamp: new Date().toISOString()
          });

          return result;
        } catch (error) {
          const duration = Date.now() - start;

          this.monitoredTools.get(toolName).executions.push({
            success: false,
            duration,
            error: error.message,
            timestamp: new Date().toISOString()
          });

          throw error;
        }
      };
    },

    getExecutionHistory(toolName) {
      const tool = this.monitoredTools.get(toolName);
      return tool ? tool.executions : [];
    },

    getExecutionStats(toolName) {
      const executions = this.getExecutionHistory(toolName);
      if (executions.length === 0) {
        return null;
      }

      const durations = executions.map(e => e.duration);
      const successful = executions.filter(e => e.success).length;

      return {
        toolName,
        totalExecutions: executions.length,
        successful,
        failed: executions.length - successful,
        successRate: ((successful / executions.length) * 100).toFixed(1),
        averageDuration: Math.round(durations.reduce((a, b) => a + b) / durations.length),
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations)
      };
    }
  };
}
