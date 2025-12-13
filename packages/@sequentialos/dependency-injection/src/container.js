export class Container {
  constructor() {
    this.bindings = new Map();
    this.singletons = new Map();
    this.resolving = new Set();
  }

  register(key, factory, options = {}) {
    if (this.bindings.has(key)) {
      throw new Error(`Service "${key}" is already registered`);
    }
    this.bindings.set(key, {
      factory,
      singleton: options.singleton !== false,
      dependencies: options.dependencies || []
    });
  }

  resolve(key) {
    if (this.resolving.has(key)) {
      throw new Error(`Circular dependency detected: ${key}`);
    }

    if (this.singletons.has(key)) {
      return this.singletons.get(key);
    }

    if (!this.bindings.has(key)) {
      throw new Error(`Service "${key}" not found in container`);
    }

    this.resolving.add(key);
    try {
      const { factory, singleton, dependencies } = this.bindings.get(key);
      const deps = dependencies.map(dep => this.resolve(dep));
      const instance = factory(...deps);

      if (singleton) {
        this.singletons.set(key, instance);
      }

      return instance;
    } finally {
      this.resolving.delete(key);
    }
  }

  safeResolve(key, defaultValue = null) {
    try {
      return this.resolve(key);
    } catch (error) {
      if (error.message.includes('not found')) {
        return defaultValue;
      }
      throw error;
    }
  }

  has(key) {
    return this.bindings.has(key) || this.singletons.has(key);
  }

  clear() {
    this.bindings.clear();
    this.singletons.clear();
    this.resolving.clear();
  }
}

export function createContainer() {
  return new Container();
}
