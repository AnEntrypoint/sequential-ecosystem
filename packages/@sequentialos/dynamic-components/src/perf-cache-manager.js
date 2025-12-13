// Render caching and memoization
export class PerfCacheManager {
  constructor(maxSize = 500) {
    this.cache = new Map();
    this.maxCacheSize = maxSize;
  }

  memoizeRender(key, componentDef, renderFn) {
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);

      if (JSON.stringify(cached.definition) === JSON.stringify(componentDef)) {
        return cached.result;
      }
    }

    const startTime = performance.now();
    const result = renderFn(componentDef);
    const duration = performance.now() - startTime;

    this.cache.set(key, {
      definition: JSON.parse(JSON.stringify(componentDef)),
      result,
      timestamp: Date.now(),
      duration
    });

    if (this.cache.size > this.maxCacheSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];

      this.cache.delete(oldestKey);
    }

    return result;
  }

  getDuration(key) {
    const cached = this.cache.get(key);
    return cached ? cached.duration : null;
  }

  clear() {
    this.cache.clear();
  }
}
