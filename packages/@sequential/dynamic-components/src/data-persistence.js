// Data state export and import
export class DataPersistence {
  constructor(dataStore, bindingEngine, computedWatcher) {
    this.dataStore = dataStore;
    this.bindingEngine = bindingEngine;
    this.computedWatcher = computedWatcher;
  }

  exportDataState() {
    return {
      data: Object.fromEntries(this.dataStore.dataStore),
      bindings: Array.from(this.bindingEngine.bindings.entries()).map(([id, binding]) => ({
        id,
        ...binding
      })),
      computed: Array.from(this.computedWatcher.computed.entries()).map(([id, comp]) => ({
        id,
        dependencies: comp.dependencies
      })),
      exportedAt: new Date().toISOString()
    };
  }

  importDataState(state) {
    if (!state) return false;

    if (state.data) {
      Object.entries(state.data).forEach(([key, value]) => {
        this.dataStore.dataStore.set(key, value);
      });
    }

    if (state.bindings) {
      state.bindings.forEach(binding => {
        this.bindingEngine.defineBinding(binding.id, {
          source: binding.source,
          target: binding.target,
          transform: binding.transform,
          bidirectional: binding.bidirectional,
          debounce: binding.debounce
        });
      });
    }

    return true;
  }
}
