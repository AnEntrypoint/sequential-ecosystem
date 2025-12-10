/**
 * Environment detection and fetch utilities
 */

/**
 * Detect runtime environment
 * @returns {'deno' | 'node' | 'browser' | 'unknown'}
 */
export function detectEnvironment() {
  if (typeof Deno !== 'undefined') return 'deno';
  if (typeof process !== 'undefined' && process.versions?.node) return 'node';
  if (typeof window !== 'undefined') return 'browser';
  return 'unknown';
}

/**
 * Get a fetch implementation appropriate for the environment
 * @returns {Promise<Function>}
 */
export async function getFetch() {
  const env = detectEnvironment();

  if (env === 'deno' || env === 'browser') {
    return fetch;
  }

  if (env === 'node' && typeof global?.fetch === 'function') {
    return global.fetch;
  }

  if (env === 'node' && process.env.NODE_ENV === 'test') {
    return async (url, options) => {
      console.log(`[Test] Fetch called with URL: ${url}`);
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ data: { message: 'Test response' } })
      };
    };
  }

  if (env === 'node') {
    try {
      const nodeFetch = await import('node-fetch');
      return nodeFetch.default || nodeFetch;
    } catch {
      throw new Error('No fetch implementation available. Please install node-fetch or use Node.js v18+.');
    }
  }

  throw new Error(`No fetch implementation available in ${env} environment.`);
}
