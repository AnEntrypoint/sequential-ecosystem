// Computed properties and data watchers
export class ComputedWatcher {
  constructor(dataStore) {
    this.computed = new Map();
    this.watchers = new Map();
    this.dataStore = dataStore;
  }

  defineComputed(computedId, config) {
    const computed = {
      id: computedId,
      dependencies: config.dependencies || [],
      getter: config.getter,
      setter: config.setter || null,
      cached: false,
      value: null
    };

    this.computed.set(computedId, computed);
    return this;
  }

  getComputed(computedId) {
    const computed = this.computed.get(computedId);
    if (!computed) return null;

    if (!computed.cached) {
      const depValues = computed.dependencies.map(dep => this.dataStore.getData(dep));
      computed.value = computed.getter(...depValues);
      computed.cached = true;
    }

    return computed.value;
  }

  invalidateComputed(computedId) {
    const computed = this.computed.get(computedId);
    if (computed) computed.cached = false;
    return this;
  }

  defineWatcher(watcherId, config) {
    const watcher = {
      id: watcherId,
      path: config.path,
      handler: config.handler,
      immediate: config.immediate || false,
      deep: config.deep || false
    };

    if (!this.watchers.has(config.path)) {
      this.watchers.set(config.path, []);
    }

    this.watchers.get(config.path).push(watcher);

    if (watcher.immediate) {
      const currentValue = this.dataStore.getData(config.path);
      watcher.handler(currentValue, undefined);
    }

    return this;
  }

  evaluateWatchers(path, newValue) {
    const oldValue = this.dataStore.getData(path);
    const watchers = this.watchers.get(path) || [];

    watchers.forEach(watcher => {
      try {
        watcher.handler(newValue, oldValue);
      } catch (e) {
        console.error(`Error in watcher ${watcher.id}:`, e);
      }
    });
  }

  clear() {
    this.computed.clear();
    this.watchers.clear();
    return this;
  }
}
