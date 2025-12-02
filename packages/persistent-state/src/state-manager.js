import { LRUCache } from 'lru-cache';

export class StateManager {
  constructor(adapter, config = {}) {
    this.adapter = adapter;
    this.maxCacheSize = config.maxCacheSize || 1000;
    this.cacheTTL = config.cacheTTL || 300000;
    this.cleanupInterval = config.cleanupInterval || 60000;
    this.isShutdown = false;

    this.memoryCache = new LRUCache({
      max: this.maxCacheSize,
      ttl: this.cacheTTL,
      updateAgeOnGet: false,
      allowStale: true
    });
  }

  _getCacheKey(type, id) {
    return `${type}:${id}`;
  }

  async get(type, id) {
    if (this.isShutdown) {
      throw new Error('StateManager is shutdown');
    }

    const cacheKey = this._getCacheKey(type, id);
    const cached = this.memoryCache.get(cacheKey);

    if (cached !== undefined) {
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }
      this.memoryCache.delete(cacheKey);
      return null;
    }

    const data = await this.adapter.get(type, id);
    if (data) {
      this.memoryCache.set(cacheKey, { data, timestamp: Date.now() });
    }
    return data;
  }

  async set(type, id, data) {
    if (this.isShutdown) {
      throw new Error('StateManager is shutdown');
    }

    const cacheKey = this._getCacheKey(type, id);

    await this.adapter.set(type, id, data);
    this.memoryCache.set(cacheKey, { data, timestamp: Date.now() });
  }

  async delete(type, id) {
    if (this.isShutdown) {
      throw new Error('StateManager is shutdown');
    }

    const cacheKey = this._getCacheKey(type, id);
    this.memoryCache.delete(cacheKey);
    await this.adapter.delete(type, id);
  }

  async clear(type) {
    if (this.isShutdown) {
      throw new Error('StateManager is shutdown');
    }

    if (type) {
      const prefix = `${type}:`;
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(prefix)) {
          this.memoryCache.delete(key);
        }
      }
      await this.adapter.clear(type);
    } else {
      this.memoryCache.clear();
      await this.adapter.clear();
    }
  }

  async getAll(type) {
    if (this.isShutdown) {
      throw new Error('StateManager is shutdown');
    }

    return await this.adapter.getAll(type);
  }

  getCacheStats() {
    return {
      cacheSize: this.memoryCache.size,
      maxSize: this.maxCacheSize,
      ttlMs: this.cacheTTL,
      cleanupIntervalMs: this.cleanupInterval,
      isShutdown: this.isShutdown
    };
  }

  async shutdown() {
    if (this.isShutdown) return;

    this.isShutdown = true;
    this.memoryCache.clear();
    await this.adapter.shutdown();
  }
}
