/**
 * Cache Eviction Strategy
 * LRU (Least Recently Used) eviction implementation
 */

export function createEvictionStrategy(cache, expirations) {
  return {
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
        cache.delete(lruKey);
        expirations.delete(lruKey);
      }
    },

    delete(key) {
      cache.delete(key);
      expirations.delete(key);
    }
  };
}
