import { nowISO } from '@sequentialos/timestamp-utilities';

export function createErrorResponse(code, message, statusCode = 400) {
  return {
    error: {
      code,
      message,
      timestamp: nowISO()
    }
  };
}

export function errorToResponse(error) {
  return createErrorResponse(
    error.code || 'UNKNOWN_ERROR',
    error.message || 'An error occurred',
    error.httpCode || 500
  );
}
