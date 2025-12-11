import { initializeModule } from './module-loader.js';
import { executeMethodChain, formatResponse } from './chain-executor.js';

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
