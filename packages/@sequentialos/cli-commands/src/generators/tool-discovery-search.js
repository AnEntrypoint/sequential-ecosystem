/**
 * Tool Discovery Core - Search and Discovery Module
 * Tool discovery, filtering, and search functionality
 */

export function createToolDiscovery(toolsMap, metricsMap) {
  return {
    discover(filter = {}) {
      const filtered = [];

      for (const [name, tool] of toolsMap.entries()) {
        if (filter.category && tool.metadata.category !== filter.category) continue;
        if (filter.tag && !tool.metadata.tags.includes(filter.tag)) continue;
        if (filter.search && !name.toLowerCase().includes(filter.search.toLowerCase())) {
          continue;
        }

        filtered.push({
          name,
          metadata: tool.metadata,
          metrics: metricsMap.get(name)
        });
      }

      return filtered;
    },

    findByTag(tag) {
      return this.discover({ tag });
    },

    findByCategory(category) {
      return this.discover({ category });
    },

    search(query) {
      return this.discover({ search: query });
    },

    list() {
      return this.discover({});
    }
  };
}
