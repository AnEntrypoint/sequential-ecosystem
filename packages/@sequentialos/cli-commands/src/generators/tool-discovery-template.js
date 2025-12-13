/**
 * Tool Discovery Core - Template Module
 * Code template for tool discovery
 */

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
