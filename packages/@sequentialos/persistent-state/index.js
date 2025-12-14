export class PersistentStateManager {
  constructor(storage) { this.storage = storage; this.cache = new Map(); }
  async get(key) {
    if (this.cache.has(key)) return this.cache.get(key);
    const value = await this.storage.get(key);
    if (value) this.cache.set(key, value);
    return value;
  }
  async set(key, value) {
    this.cache.set(key, value);
    return await this.storage.set(key, value);
  }
}
export default { PersistentStateManager };
