// Component registry with registration, validation, search, and metadata
const MAX_CACHE_SIZE = 256;

export class DynamicComponentRegistry {
  constructor(options = {}) {
    this.components = new Map();
    this.validators = new Map();
    this.metadata = new Map();
    this.categories = new Map();
    this.maxCacheSize = options.maxCacheSize || MAX_CACHE_SIZE;
  }

  register(name, jsxCode, options = {}) {
    if (typeof jsxCode !== 'string') {
      throw new Error(`Component ${name} JSX must be a string`);
    }

    const { validator = null, category = 'default', description = '', tags = [] } =
      typeof options === 'function' ? { validator: options } : options;

    this.components.set(name, jsxCode);
    if (validator) {
      this.validators.set(name, validator);
    }

    this.metadata.set(name, { category, description, tags });
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category).push(name);
  }

  validate(name, props = {}) {
    const validator = this.validators.get(name);
    if (!validator) return true;
    return validator(props);
  }

  getByCategory(category) {
    return (this.categories.get(category) || []).map(name => ({
      name,
      code: this.components.get(name),
      meta: this.metadata.get(name)
    }));
  }

  search(query) {
    const q = query.toLowerCase();
    return Array.from(this.components.keys())
      .filter(name => {
        const meta = this.metadata.get(name) || {};
        const matches = name.toLowerCase().includes(q) ||
          meta.description?.toLowerCase().includes(q) ||
          meta.tags?.some(tag => tag.toLowerCase().includes(q));
        return matches;
      })
      .map(name => ({
        name,
        code: this.components.get(name),
        meta: this.metadata.get(name)
      }));
  }

  listCategories() {
    return Array.from(this.categories.keys());
  }

  list() {
    return Array.from(this.components.keys());
  }

  remove(name) {
    this.components.delete(name);
    this.validators.delete(name);
  }
}
