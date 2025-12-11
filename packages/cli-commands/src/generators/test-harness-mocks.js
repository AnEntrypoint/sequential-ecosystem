export function createTestHarnessMocks() {
  const mocks = new Map();
  const callHistory = [];

  return {
    mockTool(toolCategory, toolName, responseOrFn) {
      const key = `${toolCategory}:${toolName}`;
      const mockFn = typeof responseOrFn === 'function' ? responseOrFn : () => responseOrFn;

      mocks.set(key, mockFn);
      return this;
    },

    mockTaskCall(taskName, responseOrFn) {
      return this.mockTool('task', taskName, responseOrFn);
    },

    mockDatabaseQuery(queryName, responseOrFn) {
      return this.mockTool('database', queryName, responseOrFn);
    },

    mockApiCall(apiName, responseOrFn) {
      return this.mockTool('api', apiName, responseOrFn);
    },

    mockFileOperation(operation, responseOrFn) {
      return this.mockTool('file', operation, responseOrFn);
    },

    async runTask(taskFn, input) {
      callHistory.length = 0;

      const mockHostTool = async (category, name, payload) => {
        const key = `${category}:${name}`;
        callHistory.push({ category, name, payload, timestamp: Date.now() });

        if (!mocks.has(key)) {
          throw new Error(`No mock registered for ${key}. Use mockTool('${category}', '${name}', ...)`);
        }

        const mockFn = mocks.get(key);
        return await Promise.resolve(mockFn(payload));
      };

      const context = { __callHostTool__: mockHostTool };
      return await taskFn.call(context, input);
    },

    getCallHistory() {
      return callHistory;
    },

    getCallsTo(category, name) {
      return callHistory.filter(call => call.category === category && call.name === name);
    },

    getLastCall() {
      return callHistory[callHistory.length - 1];
    },

    clearHistory() {
      callHistory.length = 0;
      return this;
    },

    getMocks() {
      return mocks;
    }
  };
}
