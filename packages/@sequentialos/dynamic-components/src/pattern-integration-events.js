// Pattern integration event management
export class PatternIntegrationEvents {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return this;
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data));
    }
    return this;
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const idx = callbacks.indexOf(callback);
      if (idx >= 0) {
        callbacks.splice(idx, 1);
      }
    }
    return this;
  }

  clear() {
    this.listeners.clear();
    return this;
  }
}
