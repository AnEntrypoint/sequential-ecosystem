import { ConfigService } from './config-service.ts';
import { logger, perf } from './logging-service.ts';
import { DatabaseService } from './database-service.ts';
import { nowISO } from '@sequential/sequential-utils/timestamps';
import {
  IHealthCheckResult,
  IServiceConfig,
  IServiceContext,
  IServiceResponse
} from './base-service-types.ts';
import { ServiceError, ServiceErrorType, normalizeError } from './base-service-error.ts';
import { performHealthCheck } from './base-service-health.ts';

export abstract class BaseService {
  protected readonly config: ConfigService;
  protected readonly database: DatabaseService;
  protected readonly serviceName: string;
  protected readonly serviceVersion: string;
  protected readonly serviceConfig: IServiceConfig;

  constructor(serviceConfig: IServiceConfig) {
    this.config = ConfigService.getInstance();
    this.database = DatabaseService.getInstance();
    this.serviceName = serviceConfig.name;
    this.serviceVersion = serviceConfig.version;
    this.serviceConfig = serviceConfig;
    this.initializeService();
  }

  private initializeService(): void {
    logger.info(`Initializing service: ${this.serviceName}`, {
      version: this.serviceVersion,
      environment: this.config.environment
    });

    this.validateConfiguration();

    logger.setRequestContext({
      service: this.serviceName,
      version: this.serviceVersion
    });

    logger.info(`Service initialized successfully: ${this.serviceName}`);
  }

  protected validateConfiguration(): void {
    const validation = this.config.validate();
    if (!validation.isValid) {
      throw new ServiceError(
        ServiceErrorType.CONFIGURATION_ERROR,
        `Invalid configuration for ${this.serviceName}`,
        'CONFIG_VALIDATION_FAILED',
        { errors: validation.errors }
      );
    }
  }

  protected createServiceContext(context?: Partial<IServiceContext>): IServiceContext {
    return {
      requestId: context?.requestId || crypto.randomUUID(),
      correlationId: context?.correlationId || crypto.randomUUID(),
      service: this.serviceName,
      version: this.serviceVersion,
      ...context
    };
  }

  protected async executeOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    context?: Partial<IServiceContext>
  ): Promise<IServiceResponse<T>> {
    const serviceContext = this.createServiceContext(context);
    const timerId = perf.start(`${this.serviceName}.${operationName}`, {
      operation: operationName,
      requestId: serviceContext.requestId
    });

    try {
      logger.info(`Starting operation: ${operationName}`, {
        requestId: serviceContext.requestId,
        operation: operationName
      });

      logger.setRequestContext(serviceContext);
      const result = await operation();
      const duration = perf.end(timerId);

      logger.info(`Operation completed successfully: ${operationName}`, {
        requestId: serviceContext.requestId,
        duration,
        hasResult: !!result
      });

      return this.createSuccessResponse(result, serviceContext, duration);

    } catch (error) {
      const duration = perf.end(timerId);

      logger.error(`Operation failed: ${operationName}`, error as Error, {
        requestId: serviceContext.requestId,
        duration
      });

      return this.createErrorResponse(error as Error, serviceContext, duration);
    } finally {
      logger.clearRequestContext();
    }
  }

  protected createSuccessResponse<T>(
    data: T,
    context: IServiceContext,
    duration: number
  ): IServiceResponse<T> {
    return {
      success: true,
      data,
      metadata: {
        timestamp: nowISO(),
        duration,
        requestId: context.requestId,
        version: this.serviceVersion
      }
    };
  }

  protected createErrorResponse(
    error: Error,
    context: IServiceContext,
    duration: number
  ): IServiceResponse {
    const serviceError = normalizeError(error);

    return {
      success: false,
      error: {
        code: serviceError.code,
        message: serviceError.message,
        details: serviceError.details
      },
      metadata: {
        timestamp: nowISO(),
        duration,
        requestId: context.requestId,
        version: this.serviceVersion
      }
    };
  }

  public getServiceInfo(): { name: string; version: string; description?: string } {
    return {
      name: this.serviceName,
      version: this.serviceVersion,
      description: this.serviceConfig.description
    };
  }

  public async getHealthCheck(): Promise<IHealthCheckResult> {
    return performHealthCheck(this.serviceName, this.serviceVersion, this.config, this.database);
  }

  abstract getOperations(): string[];

  public async cleanup(): Promise<void> {
    logger.info(`Cleaning up service: ${this.serviceName}`);
    logger.info(`Service cleanup completed: ${this.serviceName}`);
  }
}

// Re-export types and utilities for backward compatibility
export {
  ServiceError,
  ServiceErrorType,
  normalizeError
} from './base-service-error.ts';

export type {
  IHealthCheckResult,
  IServiceConfig,
  IServiceContext,
  IServiceResponse,
  ServiceHealthStatus
} from './base-service-types.ts';

export {
  ServiceResponse,
  ServiceOperation
} from './base-service-utils.ts';
