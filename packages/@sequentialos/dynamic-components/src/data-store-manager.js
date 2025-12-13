// Data storage and retrieval
export class DataStoreManager {
  constructor() {
    this.dataStore = new Map();
  }

  setData(path, value, notifyCallback) {
    const oldValue = this.getDataAt(path);

    const pathParts = path.split('.');
    let obj = this.getDataStore(pathParts[0]);

    for (let i = 1; i < pathParts.length - 1; i++) {
      if (!obj[pathParts[i]]) obj[pathParts[i]] = {};
      obj = obj[pathParts[i]];
    }

    obj[pathParts[pathParts.length - 1]] = value;

    if (notifyCallback) {
      notifyCallback({
        path,
        oldValue,
        newValue: value,
        timestamp: Date.now()
      });
    }

    return this;
  }

  getData(path) {
    return this.getDataAt(path);
  }

  getDataAt(path) {
    const pathParts = path.split('.');
    let obj = this.getDataStore(pathParts[0]);

    for (const part of pathParts.slice(1)) {
      if (obj == null) return undefined;
      obj = obj[part];
    }

    return obj;
  }

  getDataStore(key) {
    if (!this.dataStore.has(key)) {
      this.dataStore.set(key, {});
    }
    return this.dataStore.get(key);
  }

  createDataContext(data = {}) {
    const context = new Map();

    Object.entries(data).forEach(([key, value]) => {
      this.dataStore.set(key, value);
      context.set(key, value);
    });

    return context;
  }

  clear() {
    this.dataStore.clear();
    return this;
  }
}
