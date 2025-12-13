/**
 * tool-registry.js
 *
 * Tool registration and discovery
 */

export function createToolRegistry() {
  const tools = new Map();

  return {
    register(toolDef) {
      tools.set(toolDef.name, toolDef);
    },

    get(toolName) {
      return tools.get(toolName);
    },

    has(toolName) {
      return tools.has(toolName);
    },

    list() {
      return Array.from(tools.values()).map(t => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters || {}
      }));
    },

    toMCPFormat() {
      return Array.from(tools.values()).map(t => ({
        name: t.name,
        description: t.description,
        input_schema: {
          type: 'object',
          properties: t.parameters || {},
          required: t.required || []
        }
      }));
    }
  };
}
