// Pattern data binding facade - maintains 100% backward compatibility
import { DataStoreManager } from './data-store-manager.js';
import { BindingEngine } from './binding-engine.js';
import { ComputedWatcher } from './computed-watcher.js';
import { ComponentBinding } from './component-binding.js';
import { DataUIBuilder } from './data-ui-builder.js';
import { DataPersistence } from './data-persistence.js';
import { DataEvents } from './data-events.js';

class PatternDataBinding {
  constructor() {
    this.dataStore = new DataStoreManager();
    this.bindingEngine = new BindingEngine(this.dataStore);
    this.computedWatcher = new ComputedWatcher(this.dataStore);
    this.componentBinding = new ComponentBinding(this.dataStore);
    this.dataUIBuilder = new DataUIBuilder(this.dataStore, this.bindingEngine.bindings);
    this.dataPersistence = new DataPersistence(this.dataStore, this.bindingEngine, this.computedWatcher);
    this.dataEvents = new DataEvents();

    // Expose for backward compatibility
    this.bindings = this.bindingEngine.bindings;
    this.dataStore_ = this.dataStore;
    this.computed = this.computedWatcher.computed;
    this.watchers = this.computedWatcher.watchers;
    this.listeners = this.dataEvents.listeners;
  }

  // Delegate to data store
  setData(path, value) {
    return this.dataStore.setData(path, value, (data) => {
      this.dataEvents.notifyListeners('dataChanged', data);
      this.bindingEngine.triggerBindingsForPath(path, value, (event, eventData) => {
        this.dataEvents.notifyListeners(event, eventData);
      });
      this.computedWatcher.evaluateWatchers(path, value);
    });
  }

  getData(path) {
    return this.dataStore.getData(path);
  }

  getDataAt(path) {
    return this.dataStore.getDataAt(path);
  }

  getDataStore(key) {
    return this.dataStore.getDataStore(key);
  }

  createDataContext(data = {}) {
    return this.dataStore.createDataContext(data);
  }

  // Delegate to binding engine
  defineBinding(bindingId, config) {
    const binding = this.bindingEngine.defineBinding(bindingId, config);
    this.dataEvents.notifyListeners('bindingDefined', { bindingId, binding });
    return binding;
  }

  triggerBindingsForPath(path, value) {
    return this.bindingEngine.triggerBindingsForPath(path, value, (event, eventData) => {
      this.dataEvents.notifyListeners(event, eventData);
    });
  }

  applyBinding(binding, sourceValue) {
    return this.bindingEngine.applyBinding(binding, sourceValue, (event, eventData) => {
      this.dataEvents.notifyListeners(event, eventData);
    });
  }

  debounceBinding(binding, value) {
    return this.bindingEngine.debounceBinding(binding, value);
  }

  // Delegate to computed watcher
  defineComputed(computedId, config) {
    return this.computedWatcher.defineComputed(computedId, config);
  }

  getComputed(computedId) {
    return this.computedWatcher.getComputed(computedId);
  }

  invalidateComputed(computedId) {
    return this.computedWatcher.invalidateComputed(computedId);
  }

  defineWatcher(watcherId, config) {
    return this.computedWatcher.defineWatcher(watcherId, config);
  }

  evaluateWatchers(path, newValue) {
    return this.computedWatcher.evaluateWatchers(path, newValue);
  }

  // Delegate to component binding
  bindComponentToData(componentDef, dataPath) {
    return this.componentBinding.bindComponentToData(componentDef, dataPath);
  }

  // Delegate to UI builder
  buildDataInspector() {
    return this.dataUIBuilder.buildDataInspector();
  }

  buildBindingEditor() {
    return this.dataUIBuilder.buildBindingEditor();
  }

  // Delegate to persistence
  exportDataState() {
    return this.dataPersistence.exportDataState();
  }

  importDataState(state) {
    return this.dataPersistence.importDataState(state);
  }

  // Delegate to events
  on(event, callback) {
    return this.dataEvents.on(event, callback);
  }

  off(event, callback) {
    return this.dataEvents.off(event, callback);
  }

  notifyListeners(event, data) {
    return this.dataEvents.notifyListeners(event, data);
  }

  clear() {
    this.dataStore.clear();
    this.bindingEngine.clear();
    this.computedWatcher.clear();
    this.dataEvents.clear();
    return this;
  }
}

function createPatternDataBinding() {
  return new PatternDataBinding();
}

export { PatternDataBinding, createPatternDataBinding };
