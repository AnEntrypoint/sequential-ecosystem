/**
 * Task Cache Manager
 * Manages task result caching with TTL, LRU eviction, and statistics
 *
 * Delegates to:
 * - cache-expiration-handler: TTL expiration management
 * - cache-eviction-strategy: LRU eviction strategy
 * - cache-stats-calculator: Cache statistics computation
 */

import { createExpirationHandler } from './cache-expiration-handler.js';
import { createEvictionStrategy } from './cache-eviction-strategy.js';
import { createStatsCalculator } from './cache-stats-calculator.js';

export function createTaskCacheManager(options = {}, keyGenerator) {
  const {
    ttl = 300000,
    maxSize = 1000
  } = options;

  const cache = new Map();
  const expirations = new Map();

  const expiration = createExpirationHandler(cache, expirations, ttl);
  const eviction = createEvictionStrategy(cache, expirations);
  const stats = createStatsCalculator(cache, maxSize, ttl);

  return {
    get(key) {
      expiration.cleanup();
      if (!cache.has(key)) return null;

      const entry = cache.get(key);
      entry.hits++;
      entry.lastAccessed = Date.now();
      return entry.value;
    },

    set(key, value) {
      if (cache.size >= maxSize) {
        eviction.evict();
      }

      const now = Date.now();
      cache.set(key, {
        value,
        hits: 0,
        lastAccessed: now,
        createdAt: now
      });

      expiration.setExpiration(key);
    },

    has(key) {
      expiration.cleanup();
      return cache.has(key);
    },

    delete(key) {
      eviction.delete(key);
    },

    clear() {
      cache.clear();
      expirations.clear();
    },

    evict() {
      eviction.evict();
    },

    getStats() {
      expiration.cleanup();
      return stats.getStats();
    },

    createCachedTask(taskFn, keyConfig = {}) {
      const { key = null } = keyConfig;

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
