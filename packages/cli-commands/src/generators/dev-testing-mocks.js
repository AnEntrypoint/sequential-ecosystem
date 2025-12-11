import { createMockToolRegistry } from './mock-tool-registry.js';
import { createServiceInterceptor } from './service-interceptor.js';

export { createMockToolRegistry, createServiceInterceptor };

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
