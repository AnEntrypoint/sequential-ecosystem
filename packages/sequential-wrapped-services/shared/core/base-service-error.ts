export enum ServiceErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

export class ServiceError extends Error {
  public readonly type: ServiceErrorType;
  public readonly code: string;
  public readonly details?: Record<string, any>;
  public readonly statusCode: number;

  constructor(
    type: ServiceErrorType,
    message: string,
    code?: string,
    details?: Record<string, any>,
    statusCode: number = 500
  ) {
    super(message);
    this.name = 'ServiceError';
    this.type = type;
    this.code = code || type;
    this.details = details;
    this.statusCode = statusCode;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      code: this.code,
      message: this.message,
      details: this.details,
      stack: this.stack
    };
  }
}

export function normalizeError(error: Error): ServiceError {
  if (error instanceof ServiceError) return error;

  const message = error.message.toLowerCase();

  if (message.includes('timeout')) {
    return new ServiceError(ServiceErrorType.TIMEOUT_ERROR, error.message, 'OPERATION_TIMEOUT', { originalError: error.message });
  }
  if (message.includes('not found')) {
    return new ServiceError(ServiceErrorType.NOT_FOUND_ERROR, error.message, 'RESOURCE_NOT_FOUND', { originalError: error.message }, 404);
  }
  if (message.includes('unauthorized') || message.includes('authentication')) {
    return new ServiceError(ServiceErrorType.AUTHENTICATION_ERROR, error.message, 'AUTHENTICATION_FAILED', { originalError: error.message }, 401);
  }
  if (message.includes('forbidden') || message.includes('authorization')) {
    return new ServiceError(ServiceErrorType.AUTHORIZATION_ERROR, error.message, 'AUTHORIZATION_FAILED', { originalError: error.message }, 403);
  }
  if (message.includes('validation')) {
    return new ServiceError(ServiceErrorType.VALIDATION_ERROR, error.message, 'VALIDATION_FAILED', { originalError: error.message }, 400);
  }

  return new ServiceError(ServiceErrorType.INTERNAL_ERROR, error.message, 'INTERNAL_ERROR', { originalError: error.message, stack: error.stack });
}
