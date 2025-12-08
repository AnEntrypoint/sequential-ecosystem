export function createTaskCache(options = {}) {
  const {
    ttl = 300000,
    maxSize = 1000,
    keyGenerator = defaultKeyGenerator
  } = options;

  const cache = new Map();
  const expirations = new Map();

  function cleanupExpired() {
    const now = Date.now();
    for (const [key, expiresAt] of expirations.entries()) {
      if (now >= expiresAt) {
        cache.delete(key);
        expirations.delete(key);
      }
    }
  }

  return {
    get(key) {
      cleanupExpired();
      if (!cache.has(key)) return null;

      const entry = cache.get(key);
      entry.hits++;
      entry.lastAccessed = Date.now();
      return entry.value;
    },

    set(key, value) {
      if (cache.size >= maxSize) {
        this.evict();
      }

      const now = Date.now();
      cache.set(key, {
        value,
        hits: 0,
        lastAccessed: now,
        createdAt: now
      });

      expirations.set(key, now + ttl);
    },

    has(key) {
      cleanupExpired();
      return cache.has(key);
    },

    delete(key) {
      cache.delete(key);
      expirations.delete(key);
    },

    clear() {
      cache.clear();
      expirations.clear();
    },

    evict() {
      let lruKey = null;
      let lruTime = Date.now();

      for (const [key, entry] of cache.entries()) {
        if (entry.lastAccessed < lruTime) {
          lruTime = entry.lastAccessed;
          lruKey = key;
        }
      }

      if (lruKey) {
        this.delete(lruKey);
      }
    },

    getStats() {
      cleanupExpired();
      const entries = Array.from(cache.values());
      const totalHits = entries.reduce((sum, e) => sum + e.hits, 0);

      return {
        size: cache.size,
        maxSize,
        utilization: ((cache.size / maxSize) * 100).toFixed(1),
        totalHits,
        averageHits: entries.length > 0 ? (totalHits / entries.length).toFixed(2) : 0,
        ttl,
        entries: entries.map(e => ({
          hits: e.hits,
          age: Date.now() - e.createdAt
        }))
      };
    },

    createCachedTask(taskFn, keyConfig = {}) {
      const { ttl: taskTtl = ttl, key = null } = keyConfig;

      return async (input) => {
        const cacheKey = key || keyGenerator(input);

        if (this.has(cacheKey)) {
          return this.get(cacheKey);
        }

        const result = await taskFn(input);
        this.set(cacheKey, result);
        return result;
      };
    }
  };
}

function defaultKeyGenerator(input) {
  if (typeof input === 'string') return input;
  if (typeof input === 'number') return String(input);
  if (typeof input === 'object') {
    return JSON.stringify(input);
  }
  return String(input);
}

export function createCachePolicies() {
  return {
    noCache: { ttl: 0, maxSize: 0 },
    shortTerm: { ttl: 60000, maxSize: 100 },
    mediumTerm: { ttl: 300000, maxSize: 500 },
    longTerm: { ttl: 3600000, maxSize: 1000 },
    unlimited: { ttl: Infinity, maxSize: 10000 }
  };
}

export function generateCachedTaskTemplate() {
  return `/**
 * Task Caching
 *
 * Cache task results with TTL and automatic expiration.
 */

import { createTaskCache } from '@sequential/task-cache';

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

export function validateCacheConfig(config) {
  const errors = [];

  if (config.ttl < 0) {
    errors.push('TTL must be >= 0');
  }

  if (config.maxSize < 0) {
    errors.push('Max size must be >= 0');
  }

  if (config.ttl === 0 && config.maxSize === 0) {
    errors.push('Cache disabled: both TTL and maxSize are 0');
  }

  return {
    valid: errors.length === 0,
    errors,
    warning: config.maxSize > 5000 ? 'Large maxSize may impact memory usage' : null
  };
}
