/**
 * Service Interceptor
 * Mocks and intercepts global service calls (fetch and tools)
 *
 * Delegates to:
 * - fetch-interceptor: HTTP request mocking
 * - tool-interceptor: Tool call mocking
 */

import { createFetchInterceptor } from './fetch-interceptor.js';
import { createToolInterceptor } from './tool-interceptor.js';

export function createServiceInterceptor() {
  const fetchInterceptor = createFetchInterceptor();
  const toolInterceptor = createToolInterceptor();

  return {
    mockFetch: fetchInterceptor.mockFetch.bind(fetchInterceptor),
    mockTool: toolInterceptor.mockTool.bind(toolInterceptor),

    async interceptFetch(url, options) {
      return fetchInterceptor.interceptFetch(url, options);
    },

    async interceptTool(category, name, payload) {
      return toolInterceptor.interceptTool(category, name, payload);
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
