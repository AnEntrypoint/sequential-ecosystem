export class StateManager {
  constructor(adapter, config = {}) {
    this.adapter = adapter;
    this.memoryCache = new Map();
    this.maxCacheSize = config.maxCacheSize || 1000;
    this.cacheTTL = config.cacheTTL || 300000;
    this.cleanupInterval = config.cleanupInterval || 60000;
    this.isShutdown = false;

    this.cleanupTimer = setInterval(() => this._cleanupExpiredEntries(), this.cleanupInterval);
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

    if (cached) {
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

    if (this.memoryCache.size > this.maxCacheSize) {
      this._evictOldestEntry();
    }
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

  _cleanupExpiredEntries() {
    const now = Date.now();
    const expired = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > this.cacheTTL) {
        expired.push(key);
      }
    }

    expired.forEach(key => this.memoryCache.delete(key));
  }

  _evictOldestEntry() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
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
    clearInterval(this.cleanupTimer);
    this.memoryCache.clear();
    await this.adapter.shutdown();
  }
}
