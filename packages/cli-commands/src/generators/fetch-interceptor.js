/**
 * Fetch Interceptor
 * Mocks and intercepts fetch requests
 */

export function createFetchInterceptor() {
  const fetchStubs = [];

  return {
    mockFetch(urlPattern, response) {
      const pattern = typeof urlPattern === 'string' ? new RegExp(urlPattern) : urlPattern;
      fetchStubs.push({ pattern, response });
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

    getStubs() {
      return fetchStubs;
    }
  };
}
