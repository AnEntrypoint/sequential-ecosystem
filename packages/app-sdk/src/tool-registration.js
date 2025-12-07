export class ToolRegistry {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.tools = new Map();
  }

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

  async initAll() {
    const promises = Array.from(this.tools.entries()).map(([name, toolDef]) => {
      return this.remote(name, toolDef.fn, toolDef.description, { category: toolDef.category });
    });
    await Promise.allSettled(promises);
    return this.tools.size;
  }
}
