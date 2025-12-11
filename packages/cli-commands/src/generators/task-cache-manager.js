export function createTaskCacheManager(options = {}, keyGenerator) {
  const {
    ttl = 300000,
    maxSize = 1000
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
