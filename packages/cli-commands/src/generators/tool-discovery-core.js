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

    discover(filter = {}) {
      const filtered = [];

      for (const [name, tool] of tools.entries()) {
        if (filter.category && tool.metadata.category !== filter.category) continue;
        if (filter.tag && !tool.metadata.tags.includes(filter.tag)) continue;
        if (filter.search && !name.toLowerCase().includes(filter.search.toLowerCase())) {
          continue;
        }

        filtered.push({
          name,
          metadata: tool.metadata,
          metrics: metrics.get(name)
        });
      }

      return filtered;
    },

    findByTag(tag) {
      return this.discover({ tag });
    },

    findByCategory(category) {
      return this.discover({ category });
    },

    search(query) {
      return this.discover({ search: query });
    },

    getMetrics(toolName) {
      if (!metrics.has(toolName)) {
        return null;
      }

      const metric = metrics.get(toolName);
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

      for (const toolName of metrics.keys()) {
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

    getToolStats() {
      const allMetrics = this.getAllMetrics();
      const totalCalls = allMetrics.reduce((sum, m) => sum + m.calls, 0);
      const totalFailures = allMetrics.reduce((sum, m) => sum + m.failures, 0);

      return {
        totalTools: tools.size,
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
        metrics.set(toolName, {
          calls: 0,
          successes: 0,
          failures: 0,
          totalDuration: 0,
          minDuration: Infinity,
          maxDuration: 0,
          lastCalled: null
        });
      } else {
        for (const key of metrics.keys()) {
          metrics.set(key, {
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
    },

    list() {
      return Array.from(tools.entries()).map(([name, tool]) => ({
        name,
        metadata: tool.metadata
      }));
    }
  };
}

export function generateToolDiscoveryTemplate() {
  return `/**
 * Tool Discovery & Metrics
 *
 * Register tools and discover them at runtime with performance metrics.
 */

import { createToolRegistry } from '@sequentialos/tool-discovery';

const registry = createToolRegistry();

// Register tools
registry
  .register('fetchUser', async (input) => {
    const response = await fetch(\`/api/users/\${input.id}\`);
    return response.json();
  }, {
    description: 'Fetch user data from API',
    category: 'api',
    tags: ['user', 'data', 'readonly'],
    params: [{ name: 'id', type: 'number', required: true }]
  })
  .register('createUser', async (input) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    return response.json();
  }, {
    description: 'Create a new user',
    category: 'api',
    tags: ['user', 'write'],
    params: [{ name: 'name', type: 'string', required: true }]
  })
  .register('cacheData', async (input) => {
    return { cached: true, key: \`cache-\${Date.now()}\` };
  }, {
    description: 'Cache data locally',
    category: 'storage',
    tags: ['cache']
  });

// Discover tools
export function discoverByCategory(category) {
  return registry.findByCategory(category);
}

export function discoverByTag(tag) {
  return registry.findByTag(tag);
}

export function searchTools(query) {
  return registry.search(query);
}

// List all tools
export function listAllTools() {
  return registry.list();
}

// Get metrics
export function getToolMetrics(toolName) {
  return registry.getMetrics(toolName);
}

export function getAllMetrics() {
  return registry.getAllMetrics();
}

export function getSlowTools(threshold = 1000) {
  return registry.getSlowTools(threshold);
}

// Tool stats
export function getToolStats() {
  return registry.getToolStats();
}

// Execute tool
export async function useTool(toolName, input) {
  return await registry.execute(toolName, input);
}
`;
}
