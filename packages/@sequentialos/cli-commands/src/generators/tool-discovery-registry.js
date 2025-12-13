/**
 * Tool Discovery Core - Registry Module
 * Tool registration and execution
 */

export function createToolRegistry() {
  const tools = new Map();
  const metrics = new Map();

  return {
    register(toolName, toolFn, metadata = {}) {
      tools.set(toolName, {
        fn: toolFn,
        metadata: {
          name: toolName,
          description: metadata.description || 'No description',
          version: metadata.version || '1.0.0',
          category: metadata.category || 'general',
          tags: metadata.tags || [],
          params: metadata.params || [],
          ...metadata
        },
        registeredAt: new Date().toISOString()
      });

      metrics.set(toolName, {
        calls: 0,
        successes: 0,
        failures: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        lastCalled: null
      });

      return this;
    },

    async execute(toolName, input) {
      const tool = tools.get(toolName);
      if (!tool) {
        throw new Error(`Tool not found: ${toolName}`);
      }

      const metric = metrics.get(toolName);
      const start = Date.now();

      try {
        const result = await tool.fn(input);
        const duration = Date.now() - start;

        metric.calls++;
        metric.successes++;
        metric.totalDuration += duration;
        metric.minDuration = Math.min(metric.minDuration, duration);
        metric.maxDuration = Math.max(metric.maxDuration, duration);
        metric.lastCalled = new Date().toISOString();

        return { success: true, result };
      } catch (error) {
        const duration = Date.now() - start;

        metric.calls++;
        metric.failures++;
        metric.totalDuration += duration;
        metric.lastCalled = new Date().toISOString();

        throw { success: false, error: error.message };
      }
    },

    getMetrics(toolName) {
      if (!metrics.has(toolName)) {
        return null;
      }

      const metric = metrics.get(toolName);
      const avgDuration = metric.calls > 0 ? metric.totalDuration / metric.calls : 0;
      const successRate = metric.calls > 0 ? (metric.successes / metric.calls) * 100 : 0;

      return {
        name: toolName,
        calls: metric.calls,
        successes: metric.successes,
        failures: metric.failures,
        avgDuration: Math.round(avgDuration),
        minDuration: metric.minDuration === Infinity ? 0 : metric.minDuration,
        maxDuration: metric.maxDuration,
        successRate: Math.round(successRate),
        lastCalled: metric.lastCalled
      };
    },

    getAllMetrics() {
      const allMetrics = [];
      for (const toolName of tools.keys()) {
        allMetrics.push(this.getMetrics(toolName));
      }
      return allMetrics;
    }
  };
}
