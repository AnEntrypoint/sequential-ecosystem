/**
 * ComponentRegistry - Singleton pattern for managing React component registration
 *
 * Provides a global registry for dynamically registering and retrieving React components
 * by name. This allows for runtime component resolution without hardcoded imports.
 */

class ComponentRegistry {
  constructor() {
    if (ComponentRegistry.instance) {
      return ComponentRegistry.instance;
    }

    this.components = new Map();
    ComponentRegistry.instance = this;
  }

  /**
   * Register a React component with a given name
   * @param {string} name - Unique identifier for the component
   * @param {React.Component|Function} component - React component (class or functional)
   * @throws {Error} If name is not a string or component is not provided
   */
  register(name, component) {
    if (typeof name !== 'string' || !name) {
      throw new Error('Component name must be a non-empty string');
    }

    if (!component) {
      throw new Error(`Component is required for registration: ${name}`);
    }

    this.components.set(name, component);
  }

  /**
   * Get a registered component by name
   * @param {string} name - Component name
   * @returns {React.Component|Function|undefined} The registered component or undefined
   */
  get(name) {
    return this.components.get(name);
  }

  /**
   * Check if a component is registered
   * @param {string} name - Component name
   * @returns {boolean} True if component exists in registry
   */
  has(name) {
    return this.components.has(name);
  }

  /**
   * List all registered component names
   * @returns {string[]} Array of registered component names
   */
  list() {
    return Array.from(this.components.keys());
  }

  /**
   * Unregister a component
   * @param {string} name - Component name to remove
   * @returns {boolean} True if component was removed, false if not found
   */
  unregister(name) {
    return this.components.delete(name);
  }

  /**
   * Clear all registered components
   */
  clear() {
    this.components.clear();
  }

  /**
   * Get the number of registered components
   * @returns {number} Count of registered components
   */
  get size() {
    return this.components.size;
  }
}

// Export singleton instance
const registry = new ComponentRegistry();
export default registry;
