/**
 * Tool Interceptor
 * Mocks and intercepts tool calls
 */

export function createToolInterceptor() {
  const toolMocks = new Map();

  return {
    mockTool(category, name, responseOrFn) {
      const key = `${category}:${name}`;
      const mockFn = typeof responseOrFn === 'function' ? responseOrFn : () => responseOrFn;
      toolMocks.set(key, mockFn);
      return this;
    },

    async interceptTool(category, name, payload) {
      const key = `${category}:${name}`;

      if (!toolMocks.has(key)) {
        throw new Error(`No mock for ${key}`);
      }

      const mockFn = toolMocks.get(key);
      return await Promise.resolve(mockFn(payload));
    },

    getMocks() {
      return toolMocks;
    }
  };
}
