/**
 * tool-cache.js
 *
 * Tool caching and cache management
 */

export function createToolCache() {
  const cache = new Map();

  return {
    has(toolName) {
      return cache.has(toolName);
    },

    get(toolName) {
      return cache.get(toolName);
    },

    set(toolName, toolModule) {
      cache.set(toolName, toolModule);
      return toolModule;
    },

    clear() {
      cache.clear();
    },

    getStats() {
      return {
        cachedTools: cache.size
      };
    },

    getCacheMap() {
      return cache;
    }
  };
}
