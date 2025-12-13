import createHttpError from 'http-errors';
import { nowISO, createTimestamps, updateTimestamp } from '@sequentialos/timestamp-utilities';

export class AppError extends Error {
  constructor(httpCode, code, message, category = null, details = {}) {
    super(message);
    this.httpCode = httpCode;
    this.code = code;
    this.category = category;
    this.details = details;
    this.timestamp = nowISO();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      category: this.category,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

export const ERROR_CODES = {
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', httpCode: 400, category: 'validation' },
  NOT_FOUND: { code: 'NOT_FOUND', httpCode: 404, category: 'resource' },
  FORBIDDEN: { code: 'FORBIDDEN', httpCode: 403, category: 'authorization' },
  CONFLICT: { code: 'CONFLICT', httpCode: 409, category: 'conflict' },
  UNPROCESSABLE_ENTITY: { code: 'UNPROCESSABLE_ENTITY', httpCode: 422, category: 'data' },
  BAD_REQUEST: { code: 'BAD_REQUEST', httpCode: 400, category: 'request' },
  INTERNAL_SERVER_ERROR: { code: 'INTERNAL_SERVER_ERROR', httpCode: 500, category: 'server' },
  FILE_NOT_FOUND: { code: 'FILE_NOT_FOUND', httpCode: 404, category: 'file' },
  FILE_TOO_LARGE: { code: 'FILE_TOO_LARGE', httpCode: 413, category: 'file' },
  PATH_TRAVERSAL: { code: 'PATH_TRAVERSAL', httpCode: 403, category: 'security' }
};

function getHttpErrorClass(statusCode) {
  const errorMap = {
    400: createHttpError.BadRequest,
    403: createHttpError.Forbidden,
    404: createHttpError.NotFound,
    409: createHttpError.Conflict,
    413: createHttpError.PayloadTooLarge,
    422: createHttpError.UnprocessableEntity,
    500: createHttpError.InternalServerError
  };
  return errorMap[statusCode] || createHttpError.InternalServerError;
}

export function createError(errorDef, message, details = {}) {
  const HttpError = getHttpErrorClass(errorDef.httpCode);
  const error = new HttpError(message);
  error.code = errorDef.code;
  error.category = errorDef.category;
  error.details = details;
  error.timestamp = nowISO();
  return error;
}

export function createValidationError(message, field = null) {
  return createError(ERROR_CODES.VALIDATION_ERROR, message, { field });
}

export function createNotFoundError(resource) {
  return createError(ERROR_CODES.NOT_FOUND, `${resource} not found`, { resource });
}

export function createForbiddenError(message = 'Access denied') {
  return createError(ERROR_CODES.FORBIDDEN, message);
}

export function createConflictError(message = 'Resource conflict') {
  return createError(ERROR_CODES.CONFLICT, message);
}

export function createUnprocessableError(message, details = {}) {
  return createError(ERROR_CODES.UNPROCESSABLE_ENTITY, message, details);
}

export function createBadRequestError(message) {
  return createError(ERROR_CODES.BAD_REQUEST, message);
}

export function createServerError(message, originalError = null) {
  return createError(ERROR_CODES.INTERNAL_SERVER_ERROR, message, { originalError: originalError?.message });
}

export function createFileError(code, message, details = {}) {
  const errorDef = ERROR_CODES[code] || ERROR_CODES.INTERNAL_SERVER_ERROR;
  return createError(errorDef, message, details);
}

export function categorizeError(error) {
  if (error instanceof AppError || error.code) return error.category || 'unknown';
  if (error.code?.includes('ENOENT')) return 'file';
  if (error.code?.includes('EACCES')) return 'authorization';
  if (error.code?.includes('EISDIR')) return 'resource';
  return 'unknown';
}

export function createErrorHandler() {
  return (err, req, res, next) => {
    const isAppError = err instanceof AppError || (err.code && err.category);
    const statusCode = err.status || err.statusCode || 500;
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    const category = err.category || (statusCode === 500 ? 'server' : 'request');
    const timestamp = err.timestamp || nowISO();

    res.status(statusCode).json({
      error: {
        code,
        message: err.message || 'Unknown error',
        category,
        requestId: req.requestId,
        ...(err.details && Object.keys(err.details).length > 0 && { details: err.details }),
        ...(process.env.DEBUG && { stack: err.stack })
      },
      timestamp
    });
  };
}
