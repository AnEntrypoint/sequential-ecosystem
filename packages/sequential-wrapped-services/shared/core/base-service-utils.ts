import { logger, perf } from './logging-service.ts';
import { IServiceResponse } from './base-service-types.ts';
import { nowISO } from '@sequential/sequential-utils/timestamps';
import { BaseService } from './base-service.ts';

export const ServiceResponse = {
  success: <T>(data: T, requestId?: string): IServiceResponse<T> => ({
    success: true,
    data,
    metadata: {
      timestamp: nowISO(),
      duration: 0,
      requestId,
      version: 'unknown'
    }
  }),

  error: (
    code: string,
    message: string,
    details?: Record<string, any>,
    requestId?: string
  ): IServiceResponse => ({
    success: false,
    error: { code, message, details },
    metadata: {
      timestamp: nowISO(),
      duration: 0,
      requestId,
      version: 'unknown'
    }
  })
};

export function ServiceOperation(operationName: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    if (!descriptor) {
      console.warn(`ServiceOperation decorator: Cannot apply to ${propertyName} - descriptor not found`);
      return descriptor;
    }

    const method = descriptor.value;

    if (!method || typeof method !== 'function') {
      console.warn(`ServiceOperation decorator: Cannot apply to ${propertyName} - method not found or not a function`);
      return descriptor;
    }

    descriptor.value = async function (...args: any[]) {
      const serviceName = (this as BaseService).serviceName;
      const timerId = perf.start(`${serviceName}.${operationName}`);

      try {
        logger.info(`Starting ${operationName}`, {
          service: serviceName,
          operation: operationName,
          args: args.length
        });

        const result = await method.apply(this, args);

        const duration = perf.end(timerId);
        logger.info(`Completed ${operationName}`, {
          service: serviceName,
          operation: operationName,
          duration,
          success: true
        });

        return result;
      } catch (error) {
        const duration = perf.end(timerId);
        logger.error(`Failed ${operationName}`, error as Error, {
          service: serviceName,
          operation: operationName,
          duration,
          success: false
        });
        throw error;
      }
    };

    return descriptor;
  };
}
