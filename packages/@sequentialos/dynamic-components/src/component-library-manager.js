// Component library manager - registers, organizes, and exports components
import { ComponentComposer } from './component-composer.js';
import { ComponentConstraints } from './component-constraints.js';
import { ComponentVariants } from './component-variants.js';

export class ComponentLibrary {
  constructor(registry) {
    this.registry = registry;
    this.composer = new ComponentComposer(registry);
    this.constraints = new ComponentConstraints();
    this.variants = new ComponentVariants(registry);
    this.categories = new Map();
    this.favorites = new Set();
    this.recent = [];
  }

  registerComponent(name, code, options = {}) {
    this.registry.register(name, code, options);

    const category = options.category || 'general';
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category).push(name);

    this.recent.unshift(name);
    if (this.recent.length > 20) this.recent.pop();

    return this;
  }

  markFavorite(componentName) {
    this.favorites.add(componentName);
    return this;
  }

  unmarkFavorite(componentName) {
    this.favorites.delete(componentName);
    return this;
  }

  isFavorite(componentName) {
    return this.favorites.has(componentName);
  }

  getFavorites() {
    return Array.from(this.favorites);
  }

  getRecent() {
    return this.recent;
  }

  getByCategory(category) {
    return this.categories.get(category) || [];
  }

  search(query) {
    return this.registry.search(query);
  }

  getComponentMetadata(name) {
    return this.registry.metadata.get(name);
  }

  listAllComponents() {
    return this.registry.list();
  }

  exportAsJSON() {
    return {
      components: Array.from(this.registry.components.entries()).map(([name, code]) => ({
        name,
        code,
        metadata: this.registry.metadata.get(name),
        isFavorite: this.favorites.has(name)
      })),
      categories: Array.from(this.categories.entries()).map(([name, items]) => ({
        name,
        items
      }))
    };
  }

  importFromJSON(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    data.components.forEach(comp => {
      this.registerComponent(comp.name, comp.code, comp.metadata);
      if (comp.isFavorite) this.markFavorite(comp.name);
    });
    return this;
  }
}
