/**
 * tool-operations.js
 *
 * Tool registry operations (register, invoke, list, get)
 */

export function createToolOperations(tools, baseUrl, appId, userId, autoRegister) {
  return {
    register(name, fn, description = '', options = {}) {
      tools.register(name, fn, description, options);
      if (autoRegister) {
        tools.remote(name, fn, description, options).catch(err => {
          console.warn(`Failed to register tool "${name}":`, err.message);
        });
      }
    },

    async initAll() {
      return await tools.initAll();
    },

    async invoke(toolName, input = {}) {
      const res = await fetch(`${baseUrl}/api/tools/${toolName}/invoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, context: { appId, userId } })
      });
      if (!res.ok) throw new Error(`Tool invocation failed: ${res.statusText}`);
      return await res.json();
    },

    async list() {
      const res = await fetch(`${baseUrl}/api/tools`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.tools || [];
    },

    async get(toolName) {
      const res = await fetch(`${baseUrl}/api/tools/${toolName}`);
      if (!res.ok) return null;
      return await res.json();
    }
  };
}
