export function createMultiLevelCache(levels = []) {
  const caches = levels.map(config => createTaskCache(config));

  return {
    async get(key) {
      for (const cache of caches) {
        if (cache.has(key)) {
          return cache.get(key);
        }
      }
      return null;
    },

    async set(key, value) {
      for (const cache of caches) {
        cache.set(key, value);
      }
    },

    getAllStats() {
      return caches.map((cache, idx) => ({
        level: idx,
        stats: cache.getStats()
      }));
    }
  };
}
