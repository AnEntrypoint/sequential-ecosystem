export function createSimpleCache(options = {}) {
  const cache = new Map();
  const ttl = options.ttl || 30000;

  return {
    get(key) {
      const entry = cache.get(key);
      if (!entry) return null;

      if (Date.now() - entry.timestamp > ttl) {
        cache.delete(key);
        return null;
      }

      return entry.data;
    },

    set(key, data) {
      cache.set(key, { data, timestamp: Date.now() });
    },

    has(key) {
      return this.get(key) !== null;
    },

    delete(key) {
      cache.delete(key);
    },

    clear() {
      cache.clear();
    },

    invalidate(pattern) {
      if (!pattern) {
        cache.clear();
        return;
      }

      const regex = new RegExp(pattern);
      for (const key of cache.keys()) {
        if (regex.test(key)) {
          cache.delete(key);
        }
      }
    },

    size() {
      return cache.size;
    }
  };
}

export function createCacheKey(category, params) {
  if (typeof params === 'object') {
    return `${category}:${JSON.stringify(params)}`;
  }
  return `${category}:${params}`;
}

export function createLRUCache(options = {}) {
  const maxSize = options.maxSize || 100;
  const ttl = options.ttl || 300000;
  const cache = new Map();
  const timestamps = new Map();
  const accessTimes = new Map();

  return {
    get(key) {
      if (!cache.has(key)) return null;

      const entry = cache.get(key);
      if (Date.now() - timestamps.get(key) > ttl) {
        cache.delete(key);
        timestamps.delete(key);
        accessTimes.delete(key);
        return null;
      }

      accessTimes.set(key, Date.now());
      return entry;
    },

    set(key, value) {
      if (cache.size >= maxSize && !cache.has(key)) {
        let lruKey = null;
        let oldestTime = Infinity;
        for (const [k, time] of accessTimes) {
          if (time < oldestTime) {
            oldestTime = time;
            lruKey = k;
          }
        }
        if (lruKey) {
          cache.delete(lruKey);
          timestamps.delete(lruKey);
          accessTimes.delete(lruKey);
        }
      }

      cache.set(key, value);
      timestamps.set(key, Date.now());
      accessTimes.set(key, Date.now());
    },

    has(key) {
      return this.get(key) !== null;
    },

    delete(key) {
      cache.delete(key);
      timestamps.delete(key);
      accessTimes.delete(key);
    },

    clear() {
      cache.clear();
      timestamps.clear();
      accessTimes.clear();
    },

    size() {
      return cache.size;
    },

    stats() {
      return {
        size: cache.size,
        maxSize,
        utilization: ((cache.size / maxSize) * 100).toFixed(2) + '%',
        ttl
      };
    }
  };
}
