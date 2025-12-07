/**
 * ToolRegistry - Register and manage tools for AppSDK
 *
 * Tools are reusable functions that can be:
 * - Registered locally (in-memory) for immediate use in the app
 * - Registered remotely (server) for persistence and discovery
 * - Invoked via SDK or API
 *
 * @example
 * // Create registry (automatic with AppSDK)
 * const registry = new ToolRegistry('http://localhost:8003');
 *
 * // Register a local tool
 * registry.register('add', (a, b) => a + b, 'Add two numbers');
 *
 * // Register remotely (persist to server)
 * await registry.remote('multiply', (a, b) => a * b, 'Multiply two numbers');
 *
 * // Initialize all tools (register all local tools to server)
 * await registry.initAll();
 */
export class ToolRegistry {
  /**
   * Create a new ToolRegistry
   * @param {string} baseUrl - Base URL for API calls (e.g., 'http://localhost:8003')
   */
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.tools = new Map();
  }

  /**
   * Register a tool locally (in-memory)
   *
   * Local registration makes the tool available within this app instance but doesn't
   * persist it to the server. Use `remote()` or `initAll()` to persist.
   *
   * @param {string} name - Tool name (required, must be non-empty)
   * @param {Function} fn - Tool implementation (async function)
   * @param {string} [description=''] - Human-readable description
   * @param {Object} [options={}] - Additional options
   * @param {string} [options.category='App'] - Tool category for organization
   * @param {Object} [options.params] - Parameter definitions (for documentation)
   * @returns {ToolRegistry} - Returns this for chaining
   *
   * @throws {Error} If name is not a non-empty string
   * @throws {Error} If fn is not a function
   *
   * @example
   * registry.register('greet', async (name) => {
   *   return `Hello, ${name}!`;
   * }, 'Greeting tool', {
   *   category: 'Utilities',
   *   params: { name: 'string' }
   * });
   */
  register(name, fn, description = '', options = {}) {
    if (typeof name !== 'string' || !name.trim()) {
      throw new Error('Tool name must be a non-empty string');
    }
    if (typeof fn !== 'function') {
      throw new Error('Tool implementation must be a function');
    }

    this.tools.set(name, { fn, description, category: options.category || 'App', params: options.params });
    return this;
  }

  /**
   * Register a tool remotely (persist to server)
   *
   * Sends a tool to the server for persistence and discovery. The tool becomes
   * available to all apps and is discoverable via /api/tools endpoints.
   *
   * @param {string} name - Tool name
   * @param {Function} fn - Tool implementation
   * @param {string} [description] - Tool description
   * @param {Object} [options={}] - Additional options
   * @param {string} [options.category='App'] - Tool category
   * @param {Object} [options.imports] - External imports needed (npm, cdn, etc)
   * @returns {Promise<void>}
   *
   * @throws {Error} If registration fails with API error
   *
   * @example
   * // Register a data transformation tool
   * await registry.remote('uppercase', async (text) => {
   *   return text.toUpperCase();
   * }, 'Convert text to uppercase', {
   *   category: 'Text Processing',
   *   imports: {}
   * });
   */
  async remote(name, fn, description, options) {
    const implementation = fn.toString();
    const definition = {
      implementation,
      description: description || fn.name || name,
      category: options.category || 'App',
      imports: options.imports || {}
    };

    const res = await fetch(`${this.baseUrl}/api/tools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, definition })
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || `Tool registration failed: ${res.statusText}`);
    }
  }

  /**
   * Initialize all registered tools (register to server)
   *
   * Batch registers all locally-registered tools to the server. Useful for
   * initializing multiple tools at startup.
   *
   * @returns {Promise<number>} - Number of tools registered
   *
   * @example
   * // Register multiple tools at startup
   * const sdk = new AppSDK({ appId: 'my-app' });
   * sdk.tool('add', (a, b) => a + b, 'Add numbers');
   * sdk.tool('multiply', (a, b) => a * b, 'Multiply numbers');
   * sdk.tool('divide', (a, b) => a / b, 'Divide numbers');
   * const count = await sdk.initTools();
   * console.log(`Registered ${count} tools`);
   */
  async initAll() {
    const promises = Array.from(this.tools.entries()).map(([name, toolDef]) => {
      return this.remote(name, toolDef.fn, toolDef.description, { category: toolDef.category });
    });
    await Promise.allSettled(promises);
    return this.tools.size;
  }
}
