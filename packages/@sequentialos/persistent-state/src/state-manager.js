import { EventEmitter } from 'events';
import { LRUCache } from 'lru-cache';
import { nowISO, createTimestamps, updateTimestamp } from '@sequentialos/timestamp-utilities';

export class StateManager extends EventEmitter {
  constructor(adapter, config = {}) {
    super();
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

  _cloneData(data) {
    if (data === null || data === undefined) return data;
    if (typeof data !== 'object') return data;
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (e) {
      return data;
    }
  }

  async get(type, id) {
    if (this.isShutdown) {
      throw new Error('StateManager is shutdown');
    }

    const cacheKey = this._getCacheKey(type, id);
    const cached = this.memoryCache.get(cacheKey);

    if (cached !== undefined) {
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        return this._cloneData(cached.data);
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
    const oldData = this.memoryCache.get(cacheKey)?.data;
    const isNew = !oldData;

    const clonedData = this._cloneData(data);
    await this.adapter.set(type, id, clonedData);
    this.memoryCache.set(cacheKey, { data: clonedData, timestamp: Date.now() });

    if (isNew) {
      this.emit('created', { type, id, data: clonedData, timestamp: nowISO() });
    } else {
      this.emit('updated', { type, id, data: clonedData, oldData, timestamp: nowISO() });
    }
  }

  async delete(type, id) {
    if (this.isShutdown) {
      throw new Error('StateManager is shutdown');
    }

    const cacheKey = this._getCacheKey(type, id);
    const oldData = this.memoryCache.get(cacheKey)?.data;
    this.memoryCache.delete(cacheKey);
    await this.adapter.delete(type, id);

    if (oldData) {
      this.emit('deleted', { type, id, data: oldData, timestamp: nowISO() });
    }
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
