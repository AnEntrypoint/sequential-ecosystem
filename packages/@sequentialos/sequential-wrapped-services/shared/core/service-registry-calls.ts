import { httpClient } from './http-client.ts';
import { logger } from './logging-service.ts';
import type { ServiceResponse, ServiceCallContext } from './service-registry-types.ts';
import type { ServiceRegistry } from './service-registry-core.ts';

export function createCallHandler(registry: ServiceRegistry) {
  return async function call<T = any>(
    serviceName: string,
    methodName: string,
    args: any[] = [],
    context?: Partial<ServiceCallContext>
  ): Promise<ServiceResponse<T>> {
    const service = registry.getService(serviceName);
    if (!service) {
      throw new Error(`Service not found: ${serviceName}`);
    }

    const method = service.methods.find(m => m.name === methodName);
    if (!method) {
      throw new Error(`Method not found: ${serviceName}.${methodName}`);
    }

    const callContext: ServiceCallContext = {
      serviceName,
      methodName,
      requestId: `req-${Date.now()}-${Math.random()}`,
      metadata: {},
      ...context
    };

    const startTime = performance.now();
    const timerId = logger.startTimer(`Service Call: ${serviceName}.${methodName}`, {
      serviceName,
      methodName,
      requestId: callContext.requestId
    });

    try {
      const cacheKey = method.method === 'GET' ? getCacheKey(serviceName, methodName, args) : null;
      const cache = registry.getCacheMap();
      if (cacheKey) {
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 300000) {
          logger.endTimer(timerId, { success: true, cached: true });
          return {
            success: true,
            data: cached.data,
            metadata: {
              serviceName,
              methodName,
              duration: 0,
              retries: 0,
              cached: true
            }
          };
        }
      }

      const url = service.baseUrl;

      let requestBody;
      if (method.method !== 'GET') {
        if (methodName === 'processChain' && typeof args === 'object' && args !== null && 'chain' in args && !Array.isArray(args)) {
          requestBody = args;
        } else {
          requestBody = { chain: [{ property: methodName, args: args }] };
        }
      }

      const requestOptions = {
        method: 'POST',
        body: requestBody,
        timeout: method.timeout || 30000,
        retries: method.retries || 3,
        enableFlowState: true,
        serviceContext: {
          serviceName,
          methodPath: methodName.split('.'),
          taskRunId: callContext.taskRunId,
          stackRunId: callContext.stackRunId
        }
      };

      logger.debug(`Making service call: ${serviceName}.${methodName}`, {
        url,
        method: method.method,
        args: sanitizeArgs(args),
        requestId: callContext.requestId
      });

      const response = await httpClient.request<T>(url, requestOptions);

      const duration = performance.now() - startTime;
      logger.endTimer(timerId, {
        success: response.success,
        duration: Math.round(duration * 100) / 100,
        status: response.status
      });

      if (response.success && cacheKey && response.data) {
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }

      const serviceResponse: ServiceResponse<T> = {
        success: response.success,
        data: response.data,
        error: response.error,
        metadata: {
          serviceName,
          methodName,
          duration: Math.round(duration * 100) / 100,
          retries: response.metadata?.retries || 0,
          cached: !!cacheKey && cache.has(cacheKey),
          flowStatePaused: (response.data as any)?.__flowStatePaused || false
        }
      };

      if (response.success) {
        logger.info(`Service call successful: ${serviceName}.${methodName}`, {
          requestId: callContext.requestId,
          duration: serviceResponse.metadata?.duration,
          cached: serviceResponse.metadata?.cached
        });
      } else {
        logger.warn(`Service call failed: ${serviceName}.${methodName}`, {
          requestId: callContext.requestId,
          error: response.error,
          status: response.status
        });
      }

      return serviceResponse;

    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.endTimer(timerId, {
        success: false,
        duration: Math.round(duration * 100) / 100,
        error: errorMessage
      });

      logger.error(`Service call error: ${serviceName}.${methodName}`, error as Error, {
        requestId: callContext.requestId,
        args: sanitizeArgs(args)
      });

      return {
        success: false,
        error: errorMessage,
        metadata: {
          serviceName,
          methodName,
          duration: Math.round(duration * 100) / 100,
          retries: 0
        }
      };
    }
  };
}

function getCacheKey(serviceName: string, methodName: string, args: any[]): string {
  return `${serviceName}.${methodName}:${JSON.stringify(args)}`;
}

function sanitizeArgs(args: any[]): any[] {
  return args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      const sanitized = { ...arg };
      const sensitiveFields = ['password', 'token', 'key', 'secret', 'authorization'];
      for (const field of sensitiveFields) {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]';
        }
      }
      return sanitized;
    }
    return arg;
  });
}
