class PatternDataBinding {
  constructor() {
    this.bindings = new Map();
    this.dataStore = new Map();
    this.listeners = [];
    this.computed = new Map();
    this.watchers = new Map();
  }

  defineBinding(bindingId, config) {
    const binding = {
      id: bindingId,
      source: config.source,
      target: config.target,
      transform: config.transform || null,
      bidirectional: config.bidirectional || false,
      condition: config.condition || null,
      debounce: config.debounce || 0,
      validator: config.validator || null
    };

    this.bindings.set(bindingId, binding);
    this.notifyListeners('bindingDefined', { bindingId, binding });
    return binding;
  }

  setData(path, value) {
    const oldValue = this.getDataAt(path);

    const pathParts = path.split('.');
    let obj = this.getDataStore(pathParts[0]);

    for (let i = 1; i < pathParts.length - 1; i++) {
      if (!obj[pathParts[i]]) obj[pathParts[i]] = {};
      obj = obj[pathParts[i]];
    }

    obj[pathParts[pathParts.length - 1]] = value;

    this.notifyListeners('dataChanged', {
      path,
      oldValue,
      newValue: value,
      timestamp: Date.now()
    });

    this.triggerBindingsForPath(path, value);
    this.evaluateWatchers(path, value);
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
      const depValues = computed.dependencies.map(dep => this.getData(dep));
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
      const currentValue = this.getData(config.path);
      watcher.handler(currentValue, undefined);
    }

    return this;
  }

  evaluateWatchers(path, newValue) {
    const oldValue = this.getData(path);
    const watchers = this.watchers.get(path) || [];

    watchers.forEach(watcher => {
      try {
        watcher.handler(newValue, oldValue);
      } catch (e) {
        console.error(`Error in watcher ${watcher.id}:`, e);
      }
    });
  }

  triggerBindingsForPath(path, value) {
    for (const [, binding] of this.bindings) {
      if (binding.source === path) {
        this.applyBinding(binding, value);
      }
    }
  }

  applyBinding(binding, sourceValue) {
    if (binding.condition && !binding.condition(sourceValue)) {
      return;
    }

    let targetValue = sourceValue;

    if (binding.transform) {
      targetValue = binding.transform(sourceValue);
    }

    if (binding.validator && !binding.validator(targetValue)) {
      this.notifyListeners('validationError', {
        binding: binding.id,
        value: targetValue
      });
      return;
    }

    if (binding.debounce > 0) {
      this.debounceBinding(binding, targetValue);
    } else {
      this.setData(binding.target, targetValue);
    }
  }

  debounceBinding(binding, value) {
    const key = `debounce:${binding.id}`;
    clearTimeout(this.debounceTimers?.[key]);

    const timers = this.debounceTimers || {};
    timers[key] = setTimeout(() => {
      this.setData(binding.target, value);
    }, binding.debounce);

    this.debounceTimers = timers;
  }

  createDataContext(data = {}) {
    const context = new Map();

    Object.entries(data).forEach(([key, value]) => {
      this.dataStore.set(key, value);
      context.set(key, value);
    });

    return context;
  }

  bindComponentToData(componentDef, dataPath) {
    const component = JSON.parse(JSON.stringify(componentDef));

    if (component.type === 'input' || component.type === 'textarea') {
      component.value = this.getData(dataPath);
      component.onChange = (e) => {
        this.setData(dataPath, e.target.value);
      };
    } else if (component.type === 'select') {
      component.value = this.getData(dataPath);
      component.onChange = (e) => {
        this.setData(dataPath, e.target.value);
      };
    } else if (component.type === 'checkbox') {
      component.checked = this.getData(dataPath);
      component.onChange = (e) => {
        this.setData(dataPath, e.target.checked);
      };
    }

    return component;
  }

  buildDataInspector() {
    const entries = Array.from(this.dataStore.entries());

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#fafafa',
        height: '100%',
        overflow: 'auto'
      },
      children: [
        {
          type: 'heading',
          content: 'Data Inspector',
          level: 3,
          style: { margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          },
          children: entries.map(([key, value]) => ({
            type: 'box',
            style: {
              padding: '12px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'monospace'
            },
            children: [
              {
                type: 'text',
                content: `${key}:`,
                style: { fontSize: '11px', fontWeight: 600, marginBottom: '4px' }
              },
              {
                type: 'text',
                content: JSON.stringify(value).substring(0, 100),
                style: { fontSize: '10px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis' }
              }
            ]
          }))
        }
      ]
    };
  }

  buildBindingEditor() {
    const bindingsList = Array.from(this.bindings.values());

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#fafafa'
      },
      children: [
        {
          type: 'heading',
          content: 'Data Bindings',
          level: 3,
          style: { margin: 0, fontSize: '14px', fontWeight: 700 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          },
          children: bindingsList.map(binding => ({
            type: 'box',
            style: {
              padding: '12px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px'
            },
            children: [
              {
                type: 'text',
                content: `${binding.source} → ${binding.target}`,
                style: { fontSize: '11px', fontWeight: 600, marginBottom: '4px' }
              },
              {
                type: 'box',
                style: {
                  display: 'flex',
                  gap: '8px',
                  fontSize: '10px',
                  color: '#666',
                  flexWrap: 'wrap'
                },
                children: [
                  { type: 'text', content: `ID: ${binding.id}` },
                  binding.bidirectional ? { type: 'text', content: '↔ Bidirectional' } : null,
                  binding.transform ? { type: 'text', content: '🔄 Transform' } : null,
                  binding.debounce ? { type: 'text', content: `⏱ Debounce ${binding.debounce}ms` } : null
                ].filter(Boolean)
              }
            ]
          }))
        }
      ]
    };
  }

  exportDataState() {
    return {
      data: Object.fromEntries(this.dataStore),
      bindings: Array.from(this.bindings.entries()).map(([id, binding]) => ({
        id,
        ...binding
      })),
      computed: Array.from(this.computed.entries()).map(([id, comp]) => ({
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
        this.dataStore.set(key, value);
      });
    }

    if (state.bindings) {
      state.bindings.forEach(binding => {
        this.defineBinding(binding.id, {
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

  on(event, callback) {
    this.listeners.push({ event, callback });
    return this;
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
    return this;
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Data binding listener error for ${event}:`, e);
        }
      });
  }

  clear() {
    this.bindings.clear();
    this.dataStore.clear();
    this.computed.clear();
    this.watchers.clear();
    this.listeners = [];
    return this;
  }
}

function createPatternDataBinding() {
  return new PatternDataBinding();
}

export { PatternDataBinding, createPatternDataBinding };
