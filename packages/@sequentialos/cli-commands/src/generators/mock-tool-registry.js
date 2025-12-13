export function createMockToolRegistry() {
  const mocks = new Map();

  return {
    stub(category, name, responseOrFn) {
      const key = `${category}:${name}`;
      const mockFn = typeof responseOrFn === 'function' ? responseOrFn : () => responseOrFn;
      mocks.set(key, mockFn);
      return this;
    },

    stubAll(stubs) {
      for (const [key, responseOrFn] of Object.entries(stubs)) {
        const [category, name] = key.split(':');
        this.stub(category, name, responseOrFn);
      }
      return this;
    },

    async call(category, name, payload) {
      const key = `${category}:${name}`;

      if (!mocks.has(key)) {
        throw new Error(`No mock for ${key}`);
      }

      const mockFn = mocks.get(key);
      return await Promise.resolve(mockFn(payload));
    },

    has(category, name) {
      return mocks.has(`${category}:${name}`);
    },

    clear() {
      mocks.clear();
      return this;
    }
  };
}
