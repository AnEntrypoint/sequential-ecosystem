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

export function createFixtureLoader() {
  const fixtures = new Map();

  return {
    load(name, data) {
      fixtures.set(name, JSON.parse(JSON.stringify(data)));
      return this;
    },

    get(name) {
      const fixture = fixtures.get(name);
      if (!fixture) {
        throw new Error(`Fixture not found: ${name}`);
      }
      return JSON.parse(JSON.stringify(fixture));
    },

    getMany(names) {
      const result = {};
      for (const name of names) {
        result[name] = this.get(name);
      }
      return result;
    },

    has(name) {
      return fixtures.has(name);
    }
  };
}

export function createTestEnvironment() {
  const registry = createMockToolRegistry();
  const interceptor = createServiceInterceptor();
  const fixtures = createFixtureLoader();

  return {
    mockTools: registry,
    intercept: interceptor,
    fixtures,

    async runTaskWithMocks(taskFn, input, mocks) {
      for (const [key, response] of Object.entries(mocks || {})) {
        const [category, name] = key.split(':');
        registry.stub(category, name, response);
      }

      const context = {
        __callHostTool__: (category, name, payload) => registry.call(category, name, payload)
      };

      return await taskFn.call(context, input);
    },

    async runWithInterceptor(taskFn, input, setupFn) {
      setupFn(interceptor);

      const intercepted = interceptor.install(taskFn);
      try {
        return await intercepted.run(input);
      } finally {
        intercepted.restore();
      }
    },

    createTest(name, fn) {
      return {
        name,
        fn,
        async run() {
          try {
            await fn();
            return { passed: true, name };
          } catch (error) {
            return { passed: false, name, error: error.message };
          }
        }
      };
    }
  };
}

export function createEnvironmentProfile(env = 'development') {
  const profiles = {
    development: {
      database: 'sqlite://./test.db',
      apiBaseUrl: 'http://localhost:3000',
      enableMocks: true,
      logLevel: 'debug'
    },
    testing: {
      database: 'sqlite://:memory:',
      apiBaseUrl: 'http://localhost:3000',
      enableMocks: true,
      logLevel: 'error'
    },
    staging: {
      database: process.env.DATABASE_URL || 'postgresql://localhost/staging',
      apiBaseUrl: 'https://api-staging.example.com',
      enableMocks: false,
      logLevel: 'info'
    },
    production: {
      database: process.env.DATABASE_URL,
      apiBaseUrl: 'https://api.example.com',
      enableMocks: false,
      logLevel: 'warn'
    }
  };

  return profiles[env] || profiles.development;
}
