export function createToolComposerCache() {
  const toolCache = new Map();
  const cacheExpiry = 5 * 60 * 1000;

  return {
    cacheTools(tools) {
      for (const tool of tools) {
        toolCache.set(tool.name, {
          tool: tool,
          cachedAt: Date.now()
        });
      }
    },

    isCached(entry) {
      return entry && Date.now() - entry.cachedAt < cacheExpiry;
    },

    getCachedTool(toolName) {
      const entry = toolCache.get(toolName);
      if (!entry || !this.isCached(entry)) {
        if (entry) {
          toolCache.delete(toolName);
        }
        return null;
      }
      return entry.tool;
    },

    getCacheStats() {
      return {
        cachedTools: toolCache.size,
        cacheSize: Array.from(toolCache.values()).reduce(function(sum, entry) {
          return sum + JSON.stringify(entry.tool).length;
        }, 0),
        expiredCount: Array.from(toolCache.values()).filter(function(entry) {
          return Date.now() - entry.cachedAt >= cacheExpiry;
        }).length
      };
    },

    clearCache() {
      toolCache.clear();
    },

    getAllTools() {
      return toolCache;
    }
  };
}
