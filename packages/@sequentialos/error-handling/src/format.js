export function formatErrorResponse(error, statusCode = 500) {
  const code = error?.code || 'INTERNAL_ERROR';
  const message = error?.message || 'An unexpected error occurred';
  const timestamp = new Date().toISOString();

  return {
    statusCode,
    body: {
      success: false,
      error: {
        code,
        message,
        timestamp
      },
      meta: { timestamp }
    }
  };
}

export function createErrorObject(code, message, details = {}) {
  return {
    code,
    message,
    timestamp: new Date().toISOString(),
    ...details
  };
}

export function wrapErrorResponse(error, statusCode = 500) {
  const errorObj = createErrorObject(
    error?.code || 'ERROR',
    error?.message || 'An error occurred',
    { details: error?.details }
  );

  return {
    success: false,
    error: errorObj,
    meta: { timestamp: errorObj.timestamp }
  };
}

export function createValidationError(fields) {
  return {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    timestamp: new Date().toISOString(),
    fields
  };
}

export function createNotFoundError(resource, identifier) {
  return {
    code: 'NOT_FOUND',
    message: `${resource} "${identifier}" not found`,
    timestamp: new Date().toISOString()
  };
}

export function createForbiddenError(reason) {
  return {
    code: 'FORBIDDEN',
    message: `Access denied: ${reason}`,
    timestamp: new Date().toISOString()
  };
}

export function createConflictError(resource, reason) {
  return {
    code: 'CONFLICT',
    message: `${resource} conflict: ${reason}`,
    timestamp: new Date().toISOString()
  };
}

export function formatErrorForResponse(error, statusCode = 500) {
  if (!error) {
    return formatErrorResponse(
      { code: 'UNKNOWN_ERROR', message: 'Unknown error' },
      statusCode
    );
  }

  return formatErrorResponse(error, statusCode);
}

export const HTTP_STATUS_CODES = {
  VALIDATION_ERROR: 400,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export function getStatusCode(errorCode) {
  return HTTP_STATUS_CODES[errorCode] || 500;
}
