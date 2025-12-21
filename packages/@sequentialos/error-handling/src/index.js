/**
 * @module error-handling
 * Error types, factories, and utilities for Sequential OS
 */

/**
 * Custom error class with status code support
 */
export class AppError extends Error {
  constructor(message, code, statusCode = 500, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error factory functions
 */
export function createValidationError(message, field = null) {
  const error = new AppError(message, 'VALIDATION_ERROR', 400, { field });
  return error;
}

export function createNotFoundError(message, resourceType = null, resourceId = null) {
  const error = new AppError(message, 'NOT_FOUND', 404, { resourceType, resourceId });
  return error;
}

export function createForbiddenError(message, reason = null) {
  const error = new AppError(message, 'FORBIDDEN', 403, { reason });
  return error;
}

export function createPathTraversalError(path = null) {
  const message = path ? `Path traversal detected: ${path}` : 'Path traversal detected';
  const error = new AppError(message, 'PATH_TRAVERSAL', 403, { path });
  return error;
}

export function throwPathTraversal(path) {
  throw createPathTraversalError(path);
}

export function createConflictError(message, resource = null) {
  const error = new AppError(message, 'CONFLICT', 409, { resource });
  return error;
}

export function createUnprocessableError(message, reason = null) {
  const error = new AppError(message, 'UNPROCESSABLE_ENTITY', 422, { reason });
  return error;
}

export function createInternalError(message, context = {}) {
  const error = new AppError(message, 'INTERNAL_ERROR', 500, context);
  return error;
}

/**
 * Async handler wrapper to catch errors in route handlers
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Error serialization utilities
 */
export class SerializedError {
  constructor(error) {
    this.name = error.name || 'Error';
    this.message = error.message || 'Unknown error';
    this.code = error.code || 'UNKNOWN_ERROR';
    this.statusCode = error.statusCode || 500;
    this.details = error.details || {};
    this.stack = error.stack || null;
  }
}

export function serializeError(error) {
  if (!error) {
    return new SerializedError(new Error('Unknown error'));
  }
  return new SerializedError(error);
}

export function normalizeError(error) {
  if (error instanceof AppError) {
    return error;
  }
  if (error instanceof Error) {
    return new AppError(error.message, error.code || 'UNKNOWN_ERROR', 500, { originalError: error.name });
  }
  return new AppError(String(error), 'UNKNOWN_ERROR', 500);
}

export function getStackTrace(error, limit = 10) {
  if (!error || !error.stack) {
    return [];
  }
  const lines = error.stack.split('\n').slice(1, limit + 1);
  return lines.map(line => line.trim());
}

export function getUserFriendlyMessage(category, operation = '') {
  const messages = {
    VALIDATION_ERROR: 'The provided data is invalid',
    NOT_FOUND: 'The requested resource was not found',
    FORBIDDEN: 'Access to this resource is forbidden',
    PATH_TRAVERSAL: 'Invalid path detected',
    CONFLICT: 'A conflict occurred with the requested operation',
    UNPROCESSABLE_ENTITY: 'The request cannot be processed',
    INTERNAL_ERROR: 'An internal error occurred',
    UNKNOWN_ERROR: 'An unexpected error occurred'
  };
  return messages[category] || messages.UNKNOWN_ERROR;
}
