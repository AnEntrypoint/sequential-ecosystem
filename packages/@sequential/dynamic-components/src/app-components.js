/**
 * app-components.js - App Component Library Facade
 *
 * Delegates component definitions to focused module
 */

import { DynamicComponentRegistry, ComponentBuilder } from './core.js';
import { registerAppComponentDefinitions } from './app-component-definitions.js';

export const createAppComponentRegistry = () => {
  const registry = new DynamicComponentRegistry();
  const builder = new ComponentBuilder(registry);

  builder.registerBuiltins();
  registerAppComponentDefinitions(registry);

  return registry;
};

export class AppComponentLibrary {
  constructor() {
    this.registry = createAppComponentRegistry();
  }

  getComponent(name) {
    return this.registry.components.get(name);
  }

  listByCategory(category) {
    return this.registry.getByCategory(category);
  }

  search(query) {
    return this.registry.search(query);
  }

  register(name, code, options) {
    this.registry.register(name, code, options);
  }

  getRegistry() {
    return this.registry;
  }
}
