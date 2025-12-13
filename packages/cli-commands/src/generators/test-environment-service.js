/**
 * Test Environment Service
 * Orchestrates mocks, interceptors, and fixtures for testing
 */

import { createMockToolRegistry } from './mock-tool-registry.js';
import { createServiceInterceptor } from './service-interceptor.js';
import { createFixtureLoader } from './fixture-loader-service.js';

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
