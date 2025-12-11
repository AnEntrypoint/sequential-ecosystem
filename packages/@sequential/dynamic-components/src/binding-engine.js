// Data binding definition and triggering
export class BindingEngine {
  constructor(dataStore) {
    this.bindings = new Map();
    this.dataStore = dataStore;
    this.debounceTimers = {};
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
    return binding;
  }

  triggerBindingsForPath(path, value, applyCallback) {
    for (const [, binding] of this.bindings) {
      if (binding.source === path) {
        this.applyBinding(binding, value, applyCallback);
      }
    }
  }

  applyBinding(binding, sourceValue, applyCallback) {
    if (binding.condition && !binding.condition(sourceValue)) {
      return;
    }

    let targetValue = sourceValue;

    if (binding.transform) {
      targetValue = binding.transform(sourceValue);
    }

    if (binding.validator && !binding.validator(targetValue)) {
      if (applyCallback) {
        applyCallback('validationError', {
          binding: binding.id,
          value: targetValue
        });
      }
      return;
    }

    if (binding.debounce > 0) {
      this.debounceBinding(binding, targetValue);
    } else {
      this.dataStore.setData(binding.target, targetValue);
    }
  }

  debounceBinding(binding, value) {
    const key = `debounce:${binding.id}`;
    clearTimeout(this.debounceTimers[key]);

    this.debounceTimers[key] = setTimeout(() => {
      this.dataStore.setData(binding.target, value);
    }, binding.debounce);
  }

  clear() {
    this.bindings.clear();
    Object.keys(this.debounceTimers).forEach(key => {
      clearTimeout(this.debounceTimers[key]);
    });
    this.debounceTimers = {};
    return this;
  }
}
