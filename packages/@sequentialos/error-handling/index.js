export function createValidationError(message, constraints = {}) {
  const error = new Error(message);
  error.code = 'VALIDATION_ERROR';
  error.constraints = constraints;
  return error;
}

export function createError(message, code = 'UNKNOWN_ERROR', details = {}) {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  return error;
}

export function formatError(error) {
  return {
    message: error.message,
    code: error.code || 'UNKNOWN_ERROR',
    details: error.details || {}
  };
}

// Error serialization (from sequential-utils/src/errors.js)
export class SerializedError {
  constructor(error) {
    this.message = error?.message || 'Unknown error';
    this.name = error?.name || 'Error';
    this.stack = error?.stack || '';
    this.code = error?.code || null;
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      stack: this.stack,
      code: this.code
    };
  }

  toString() {
    return `${this.name}: ${this.message}`;
  }
}

export function serializeError(error) {
  if (error instanceof SerializedError) return error;
  return new SerializedError(error);
}

export function normalizeError(error) {
  if (!error) return null;
  if (error instanceof Error) return serializeError(error);
  if (typeof error === 'object') return new SerializedError(error);
  return new SerializedError(new Error(String(error)));
}

export function createErrorResponse(code, message, meta = {}) {
  return {
    success: false,
    error: {
      code,
      message
    },
    meta: {
      ...meta,
      timestamp: new Date().toISOString()
    }
  };
}

export function createErrorHandler() {
  return (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const error = serializeError(err);
    res.status(statusCode).json(createErrorResponse(
      err.code || 'INTERNAL_SERVER_ERROR',
      error.message,
      { stack: process.env.NODE_ENV === 'development' ? error.stack : undefined }
    ));
  };
}

export function createServerError(message, details = {}) {
  const error = createError(message, 'SERVER_ERROR', details);
  error.statusCode = 500;
  return error;
}

export function createForbiddenError(message, details = {}) {
  const error = createError(message, 'FORBIDDEN', details);
  error.statusCode = 403;
  return error;
}

export function throwValidationError(message, constraints = {}) {
  throw createValidationError(message, constraints);
}

export function throwNotFound(resource, id) {
  const error = createError(`${resource} not found: ${id}`, 'NOT_FOUND');
  error.statusCode = 404;
  throw error;
}

export function throwPathTraversal(path) {
  const error = createError(`Path traversal attempt detected: ${path}`, 'PATH_TRAVERSAL');
  error.statusCode = 403;
  throw error;
}

export default {
  createValidationError,
  createError,
  formatError,
  SerializedError,
  serializeError,
  normalizeError,
  createErrorResponse,
  createErrorHandler,
  createServerError,
  createForbiddenError,
  throwValidationError,
  throwNotFound,
  throwPathTraversal
};
