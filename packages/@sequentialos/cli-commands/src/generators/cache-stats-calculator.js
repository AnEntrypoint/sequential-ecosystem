/**
 * Cache Stats Calculator
 * Cache statistics and metrics computation
 */

export function createStatsCalculator(cache, maxSize, ttl) {
  return {
    getStats() {
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
    }
  };
}
