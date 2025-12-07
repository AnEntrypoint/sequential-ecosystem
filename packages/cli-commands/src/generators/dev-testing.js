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

export function generateDevTestingTemplate() {
  return `/**
 * Development Testing Framework
 *
 * Test tasks/flows/tools locally with mocks and fixtures.
 */

import { createMockToolRegistry, createServiceInterceptor, createFixtureLoader, createTestEnvironment } from '@sequential/dev-testing';

const testEnv = createTestEnvironment();

// Mock fixture data
testEnv.fixtures
  .load('user:123', { id: 123, name: 'John', email: 'john@example.com' })
  .load('orders:123', [{ id: 1, total: 100 }, { id: 2, total: 200 }]);

// Test 1: Run task with mocks
export async function testFetchUserWithMocks() {
  async function fetchUser(userId) {
    const user = await this.__callHostTool__('database', 'getUser', { id: userId });
    const orders = await this.__callHostTool__('database', 'getUserOrders', { userId });
    return { user, orders };
  }

  const result = await testEnv.runTaskWithMocks(
    fetchUser,
    123,
    {
      'database:getUser': testEnv.fixtures.get('user:123'),
      'database:getUserOrders': testEnv.fixtures.get('orders:123')
    }
  );

  console.log('✓ Test passed, user fetched:', result.user.name);
  return result;
}

// Test 2: Use mock tool registry directly
export async function testWithRegistry() {
  testEnv.mockTools
    .stub('database', 'getUser', { id: 123, name: 'Jane' })
    .stub('api', 'sendEmail', { sent: true });

  const user = await testEnv.mockTools.call('database', 'getUser', { id: 123 });
  const email = await testEnv.mockTools.call('api', 'sendEmail', { to: 'jane@example.com' });

  console.log('✓ Mocks work:', user.name, 'email sent:', email.sent);
  return { user, email };
}

// Test 3: Intercept HTTP calls
export async function testWithInterceptor() {
  async function fetchData() {
    const response = await fetch('https://api.example.com/users/123');
    return await response.json();
  }

  const result = await testEnv.runWithInterceptor(
    fetchData,
    null,
    (interceptor) => {
      interceptor.mockFetch(/api\\.example\\.com/, {
        status: 200,
        body: { id: 123, name: 'Test User' }
      });
    }
  );

  console.log('✓ HTTP intercepted:', result.name);
  return result;
}

// Test 4: Environment-aware configuration
export async function testWithEnvironment() {
  const testProfile = {
    database: 'sqlite://:memory:',
    apiBaseUrl: 'http://localhost:3000',
    enableMocks: true
  };

  console.log('✓ Using test environment:', testProfile);
  return testProfile;
}

// Test 5: Fluent test builder
export async function fluentTestExample() {
  const test = testEnv.createTest('User Fetch Test', async () => {
    const result = await testEnv.runTaskWithMocks(
      async function (userId) {
        return await this.__callHostTool__('database', 'getUser', { id: userId });
      },
      123,
      { 'database:getUser': { id: 123, name: 'Test' } }
    );

    if (!result || !result.name) {
      throw new Error('User name missing');
    }
  });

  const result = await test.run();
  console.log('✓ Test result:', result.passed ? 'PASSED' : 'FAILED');
  return result;
}

// Test 6: Multiple assertions
export async function testWithAssertions() {
  async function processData(input) {
    const data = await this.__callHostTool__('api', 'fetch', { id: input });
    return { processed: true, data };
  }

  const result = await testEnv.runTaskWithMocks(
    processData,
    123,
    { 'api:fetch': { id: 123, value: 'test' } }
  );

  // Assertions
  if (!result.processed) throw new Error('Data not processed');
  if (!result.data) throw new Error('Data missing');
  if (result.data.id !== 123) throw new Error('Wrong ID');

  console.log('✓ All assertions passed');
  return result;
}
`;
}
