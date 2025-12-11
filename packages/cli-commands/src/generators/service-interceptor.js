export function createServiceInterceptor() {
  const fetchStubs = [];
  const toolMocks = new Map();

  return {
    mockFetch(urlPattern, response) {
      const pattern = typeof urlPattern === 'string' ? new RegExp(urlPattern) : urlPattern;
      fetchStubs.push({ pattern, response });
      return this;
    },

    mockTool(category, name, responseOrFn) {
      const key = `${category}:${name}`;
      const mockFn = typeof responseOrFn === 'function' ? responseOrFn : () => responseOrFn;
      toolMocks.set(key, mockFn);
      return this;
    },

    async interceptFetch(url, options) {
      for (const { pattern, response } of fetchStubs) {
        if (pattern.test(url)) {
          if (typeof response === 'function') {
            return await Promise.resolve(response(url, options));
          }
          return {
            ok: true,
            status: response.status || 200,
            json: async () => response.body,
            text: async () => typeof response.body === 'string' ? response.body : JSON.stringify(response.body)
          };
        }
      }

      throw new Error(`No mock for URL: ${url}`);
    },

    async interceptTool(category, name, payload) {
      const key = `${category}:${name}`;

      if (!toolMocks.has(key)) {
        throw new Error(`No mock for ${key}`);
      }

      const mockFn = toolMocks.get(key);
      return await Promise.resolve(mockFn(payload));
    },

    install(taskFn) {
      const self = this;
      const originalFetch = global.fetch;
      const originalCallHostTool = global.__callHostTool__;

      global.fetch = (url, options) => self.interceptFetch(url, options);
      global.__callHostTool__ = (category, name, payload) => self.interceptTool(category, name, payload);

      return {
        async run(input) {
          try {
            return await taskFn(input);
          } finally {
            global.fetch = originalFetch;
            global.__callHostTool__ = originalCallHostTool;
          }
        },

        restore() {
          global.fetch = originalFetch;
          global.__callHostTool__ = originalCallHostTool;
        }
      };
    }
  };
}
