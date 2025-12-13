export class MemoryAdapter {
  constructor() {
    this.store = new Map();
  }

  async get(type, id) {
    const key = `${type}:${id}`;
    return this.store.get(key) || null;
  }

  async set(type, id, data) {
    const key = `${type}:${id}`;
    this.store.set(key, JSON.parse(JSON.stringify(data)));
  }

  async delete(type, id) {
    const key = `${type}:${id}`;
    this.store.delete(key);
  }

  async clear(type) {
    if (type) {
      const prefix = `${type}:`;
      for (const key of this.store.keys()) {
        if (key.startsWith(prefix)) {
          this.store.delete(key);
        }
      }
    } else {
      this.store.clear();
    }
  }

  async getAll(type) {
    const prefix = `${type}:`;
    const entries = [];
    for (const [key, value] of this.store.entries()) {
      if (key.startsWith(prefix)) {
        entries.push(JSON.parse(JSON.stringify(value)));
      }
    }
    return entries;
  }

  async shutdown() {
    this.store.clear();
  }
}
