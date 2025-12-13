/**
 * hot-reload-nested-values.js - Nested object value utilities
 *
 * Get and set values in nested objects using dot notation paths
 */

export class HotReloadNestedValues {
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  getNestedValue(obj, path) {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current == null) return undefined;
      current = current[key];
    }

    return current;
  }

  applyChanges(component, updates) {
    Object.entries(updates).forEach(([path, value]) => {
      this.setNestedValue(component, path, value);
    });
  }
}
