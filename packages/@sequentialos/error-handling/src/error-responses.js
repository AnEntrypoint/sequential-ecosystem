import { AppError, ERROR_CODES } from './app-error.js';

export class ValidationErrorResponse extends AppError {
  constructor(field, message = 'Validation failed') {
    super(400, 'VALIDATION_ERROR', message, 'validation', { field });
  }
}

export class NotFoundErrorResponse extends AppError {
  constructor(resource, id) {
    super(404, 'NOT_FOUND', `${resource} ${id} not found`, 'resource', { resource, id });
  }
}

export class PathTraversalErrorResponse extends AppError {
  constructor(path) {
    super(403, 'PATH_TRAVERSAL', 'Path traversal not allowed', 'security', { path });
  }
}

export class FileTooLargeErrorResponse extends AppError {
  constructor(size, maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024));
    super(413, 'FILE_TOO_LARGE', `File too large (max ${maxMb}MB)`, 'file', { size, maxSize });
  }
}

export class MissingFieldErrorResponse extends AppError {
  constructor(field) {
    super(400, 'MISSING_FIELD', `${field} is required`, 'validation', { field });
  }
}

export class InvalidOperationErrorResponse extends AppError {
  constructor(operation, reason) {
    super(400, 'INVALID_OPERATION', `Cannot ${operation}: ${reason}`, 'request', { operation, reason });
  }
}

export class ConflictErrorResponse extends AppError {
  constructor(resource, detail) {
    super(409, 'CONFLICT', `Conflict: ${detail}`, 'conflict', { resource, detail });
  }
}

export class UnauthorizedErrorResponse extends AppError {
  constructor(reason = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', reason, 'authorization');
  }
}

export function createErrorFromThrown(error) {
  if (error instanceof AppError) {
    return error;
  }
  if (error instanceof Error) {
    return new AppError(500, 'INTERNAL_SERVER_ERROR', error.message, 'server', { originalError: error.name });
  }
  return new AppError(500, 'INTERNAL_SERVER_ERROR', String(error), 'server');
}

export function throwValidationError(field, message) {
  throw new ValidationErrorResponse(field, message);
}

export function throwNotFound(resource, id) {
  throw new NotFoundErrorResponse(resource, id);
}

export function throwPathTraversal(path) {
  throw new PathTraversalErrorResponse(path);
}

export function throwFileTooLarge(size, maxSize) {
  throw new FileTooLargeErrorResponse(size, maxSize);
}

export function throwMissingField(field) {
  throw new MissingFieldErrorResponse(field);
}
