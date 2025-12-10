import { detectEnvironment } from './env.js';
import {
  detectInitializationPattern,
  detectCredentials,
  resolveConfig,
  validateConfig
} from './auto-detect.js';

export async function executeMethodChain(instance, chain) {
  let current = instance;

  for (const step of chain) {
    if (step.type === 'get') {
      current = current[step.property];
    } else if (step.type === 'call') {
      if (typeof current[step.property] !== 'function') {
        throw new Error(`Method '${step.property}' not found`);
      }
      current = current[step.property](...(step.args || []));
    } else {
      throw new Error(`Unknown chain step type: ${step.type}`);
    }

    if (current instanceof Promise) {
      current = await current;
    }
  }

  return current;
}

export function formatResponse(result) {
  if (result === undefined || result === null) {
    return { data: null };
  }

  if (result.data !== undefined) {
    return result;
  }

  if (result.object === 'list' && Array.isArray(result.data)) {
    return { data: result.data };
  }

  return { data: result };
}


async function dynamicRequire(moduleName) {
  if (typeof require === 'undefined') {
    const moduleImport = await import('node:module');
    const require = moduleImport.createRequire(import.meta.url);
    return require(moduleName);
  }

  return require(moduleName);
}

export async function initializeModule(config) {
  const moduleName = config.module;

  if (!moduleName) {
    return {};
  }

  let loadedModule;
  const env = detectEnvironment();

  if (env === 'node') {
    loadedModule = await dynamicRequire(moduleName);
  } else if (env === 'deno') {
    loadedModule = await import(moduleName);
  } else {
    throw new Error('Unsupported runtime environment');
  }

  const resolvedConfig = await resolveConfig(config, loadedModule);

  const validation = validateConfig(resolvedConfig, loadedModule);
  if (!validation.valid) {
    throw new Error(`Configuration invalid: ${validation.errors.join(', ')}`);
  }

  const pattern = detectInitializationPattern(loadedModule);

  if (resolvedConfig.factory && typeof loadedModule[resolvedConfig.factory] === 'function') {
    const args = resolvedConfig.args || [];
    if (pattern.isAsync) {
      return await loadedModule[resolvedConfig.factory](...args);
    } else {
      return loadedModule[resolvedConfig.factory](...args);
    }
  }

  if (resolvedConfig.factory === 'default') {
    if (typeof loadedModule.default === 'function') {
      if (pattern.isClass) {
        return new loadedModule.default(resolvedConfig.options || {});
      } else if (pattern.isAsync) {
        return await loadedModule.default(resolvedConfig.options || {});
      } else {
        return loadedModule.default(resolvedConfig.options || {});
      }
    }
    return loadedModule.default;
  }

  if (pattern.factory) {
    const fn = loadedModule[pattern.factory];
    const args = resolvedConfig.args || [];
    if (pattern.isAsync) {
      return await fn(...args);
    } else {
      return fn(...args);
    }
  }

  if (typeof loadedModule.default === 'function') {
    if (isClass(loadedModule.default)) {
      return new loadedModule.default(resolvedConfig.options || {});
    } else {
      return await loadedModule.default(resolvedConfig.options || {});
    }
  }

  return loadedModule;
}

function isClass(fn) {
  const str = fn.toString();
  return /^class\s/.test(str) || /^class\s+\w+/.test(str);
}

export async function processSdkRequest(requestData, sdkConfig = {}) {
  try {
    const { chain, config = {}, service } = requestData;

    if (!Array.isArray(chain)) {
      return {
        status: 400,
        body: {
          error: {
            message: 'Invalid request: chain must be an array',
            code: 'INVALID_CHAIN_FORMAT',
            status: 400
          }
        }
      };
    }

    const finalConfig = service ? sdkConfig : config;

    let instance;
    try {
      instance = finalConfig.instance || await initializeModule(finalConfig);
    } catch (initErr) {
      return {
        status: 500,
        body: {
          error: {
            message: `Failed to initialize SDK: ${initErr.message}`,
            code: 'SDK_INIT_ERROR',
            status: 500,
            details: initErr.code
          }
        }
      };
    }

    let result;
    try {
      result = await executeMethodChain(instance, chain);
    } catch (execErr) {
      const statusCode = execErr.status || (execErr.code === 'NOT_FOUND' ? 404 : 500);
      return {
        status: statusCode,
        body: {
          error: {
            message: execErr.message || 'Failed to execute method chain',
            code: execErr.code || 'CHAIN_EXECUTION_ERROR',
            status: statusCode
          }
        }
      };
    }

    return {
      status: 200,
      body: formatResponse(result)
    };
  } catch (err) {
    return {
      status: err.status || 500,
      body: {
        error: {
          message: err.message || 'Internal server error',
          code: err.code || 'UNKNOWN_ERROR',
          status: err.status || 500,
          name: err.name
        }
      }
    };
  }
}

export function addCorsHeaders(res, origins = '*') {
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', origins);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  return res;
}

export function createDenoHandler(options = {}) {
  const path = options.path || '/api/sdk-proxy';
  const servicePathPrefix = options.servicePathPrefix || '/api/proxy/';

  return async (request) => {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: addCorsHeaders()
      });
    }

    if (request.method !== 'POST') {
      return false;
    }

    try {
      let result;

      if (url.pathname.startsWith(servicePathPrefix)) {
        const service = url.pathname.substring(servicePathPrefix.length);
        const requestData = await request.json();
        const modifiedRequest = {
          ...requestData,
          service
        };
        result = await processSdkRequest(modifiedRequest);
      }
      else if (url.pathname === path) {
        const requestData = await request.json();
        result = await processSdkRequest(requestData);
      }
      else {
        return false;
      }

      return new Response(JSON.stringify(result.body), {
        status: result.status,
        headers: addCorsHeaders({ 'Content-Type': 'application/json' })
      });
    } catch (err) {
      return new Response(JSON.stringify({
        error: { message: 'Internal server error', cause: err.message }
      }), {
        status: 500,
        headers: addCorsHeaders({ 'Content-Type': 'application/json' })
      });
    }
  };
}

let createExpressMiddleware;

if (detectEnvironment() === 'node') {
  createExpressMiddleware = function (options = {}) {
    const path = options.path || '/api/sdk-proxy';
    const servicePathPrefix = options.servicePathPrefix || '/api/proxy/';

    return async (req, res, next) => {
      if (req.method === 'OPTIONS') {
        res.set(addCorsHeaders()).status(204).end();
        return;
      }

      if (req.method !== 'POST') {
        return next();
      }

      try {
        let result;

        if (req.path.startsWith(servicePathPrefix)) {
          const service = req.path.substring(servicePathPrefix.length);
          const modifiedRequest = {
            ...req.body,
            service
          };
          result = await processSdkRequest(modifiedRequest);
        }
        else if (req.path === path) {
          result = await processSdkRequest(req.body);
        }
        else {
          return next();
        }

        return res.set(addCorsHeaders()).status(result.status).json(result.body);
      } catch (err) {
        return res.set(addCorsHeaders()).status(500).json({
          error: { message: 'Internal server error', cause: err.message }
        });
      }
    };
  };

  if (typeof process !== 'undefined' && process.argv[1] === import.meta.url) {
    try {
      const { default: express } = await import('express');
      const app = express();
      app.use(express.json());
      app.use(createExpressMiddleware());

      const port = process.env.PORT || 3000;
      app.listen(port, () => {
        console.log(`SDK Proxy server running on port ${port}`);
        console.log(`Endpoint: http://localhost:${port}/api/sdk-proxy`);
        console.log(`Service endpoints: http://localhost:${port}/api/proxy/:service`);
      });
    } catch (err) {
      console.error('Failed to start Express server:', err);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    executeMethodChain,
    formatResponse,
    detectEnvironment,
    initializeModule,
    addCorsHeaders,
    processSdkRequest,
    createDenoHandler,
    createExpressMiddleware
  };
}
