import { detectEnvironment, getFetch } from './env.js';

function createSdkProxy(config, extraConfig = {}) {
  // Handle shorthand string format: "module:factory" or "module"
  if (typeof config === 'string') {
    if (config.includes('/')) {
      // Handle service endpoint format: 'service/supabase'
      const parts = config.split('/');
      if (parts.length === 2 && parts[0] === 'service') {
        config = { service: parts[1] };
      } else {
        throw new Error(`Invalid service format. Expected 'service/NAME', got '${config}'`);
      }
    } else {
      // Handle module:factory format
      const parts = config.split(':');
      const module = parts[0];
      const factory = parts.length > 1 ? parts[1] : undefined;
      config = { module, factory };
    }
  }

  // Merge with extra config
  config = { ...config, ...extraConfig };

  // Create SDK proxy with empty chain
  return buildProxy([], config);
}

/**
 * Creates a service-specific SDK proxy.
 *
 * @param {string} serviceName - Name of the service
 * @param {Object} [options] - Additional options including:
 *   - baseUrl: Base URL for the service endpoint (default: 'http://localhost:3000')
 *   - args: Arguments to pass to the service constructor
 * @returns {Proxy} Proxy object that records method chains
 */
export function createServiceProxy(serviceName, options = {}) {
  const baseUrl = options.baseUrl || 'http://localhost:3000';
  return createSdkProxy({
    service: serviceName,
    endpoint: `${baseUrl}/api/proxy/${serviceName}`,
    ...options
  });
}


/**
 * Builds a recursive proxy to capture property accesses and method calls.
 *
 * @param {Array} chain - Current chain of calls and property accesses
 * @param {Object} config - SDK configuration
 * @returns {Proxy}
 */
function buildProxy(chain, config) {
  return new Proxy(() => {}, {
    get(_, prop) {
      if (prop === Symbol.toStringTag) return 'SDKProxy';

      if (['then', 'catch', 'finally'].includes(prop)) {
        const promise = Promise.resolve().then(() => executeChain(chain, config));
        return promise[prop].bind(promise);
      }

      const newChain = [...chain, { type: 'get', property: prop }];
      return buildProxy(newChain, config);
    },
    apply(_target, _thisArg, args) {
      if (chain.length === 0) throw new Error('Cannot call function on empty chain');

      const last = chain[chain.length - 1];
      if (last.type === 'get') {
        const newChain = [
          ...chain.slice(0, -1),
          { type: 'call', property: last.property, args }
        ];
        return buildProxy(newChain, config);
      } else {
        throw new Error('Unexpected chain state');
      }
    }
  });
}

/**
 * Choose endpoint based on configuration
 *
 * @param {Object} config - SDK configuration
 * @returns {string} - Endpoint URL
 */
function getEndpoint(config) {
  if (config.endpoint) return config.endpoint;

  const baseUrl = config.baseUrl || 'http://localhost:3000';

  if (config.service) {
    return `${baseUrl}/api/proxy/${config.service}`;
  }

  return `${baseUrl}/api/sdk-proxy`;
}

/**
 * Executes the recorded property/method chain on the server.
 *
 * @param {Array} chain - Chain of property accesses and method calls
 * @param {Object} config - SDK configuration
 * @returns {Promise<any>}
 */
async function executeChain(chain, config) {
  const endpoint = getEndpoint(config);

  const body = JSON.stringify({
    chain,
    config: {
      module: config.module,
      factory: config.factory,
      args: config.args,
      options: config.options
    }
  });

  let fetchImpl;
  fetchImpl = await getFetch();

  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.headers || {})
    },
    body
  });

  if (!response.ok) {
    console.error(response);
    throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();

  if (result.error) {
    const error = new Error(result.error.message || 'SDK proxy error');
    if (result.error.code) error.code = result.error.code;
    if (result.error.status) error.status = result.error.status;
    if (result.error.name) error.name = result.error.name;
    throw error;
  }

  return result.data !== undefined ? result.data : result;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createServiceProxy
  };
}
