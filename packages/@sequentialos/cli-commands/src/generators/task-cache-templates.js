export function generateCachedTaskTemplate() {
  return `/**
 * Task Caching
 *
 * Cache task results with TTL and automatic expiration.
 */

import { createTaskCache } from '@sequentialos/task-cache';

const cache = createTaskCache({
  ttl: 300000,
  maxSize: 1000
});

// Cached task implementation
export const cachedFetch = cache.createCachedTask(
  async (input) => {
    const response = await fetch(\`https://api.example.com/users/\${input.id}\`);
    return await response.json();
  },
  { ttl: 600000, key: null }
);

export async function fetchUser(input) {
  return await cachedFetch(input);
}

export function getCacheStats() {
  return cache.getStats();
}

export function clearCache() {
  cache.clear();
}

// Manual cache control
export async function fetchWithManualCache(input) {
  const cacheKey = \`user-\${input.id}\`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const result = await __callHostTool__('task', 'fetch-user-api', input);
  cache.set(cacheKey, result);
  return result;
}

// Cache different policies
const policies = {
  noCache: { ttl: 0 },
  shortTerm: { ttl: 60000 },
  mediumTerm: { ttl: 300000 },
  longTerm: { ttl: 3600000 }
};

export async function cachedAPICall(input, policy = 'mediumTerm') {
  const policyConfig = policies[policy];
  const cacheKey = \`api-\${input.endpoint}-\${JSON.stringify(input.params)}\`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const result = await fetch(input.endpoint, { body: JSON.stringify(input.params) })
    .then(r => r.json());

  cache.set(cacheKey, result);
  return result;
}
`;
}
