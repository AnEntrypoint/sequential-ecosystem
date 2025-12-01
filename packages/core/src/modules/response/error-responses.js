/**
 * @module error-responses
 * Standardized HTTP error response builder
 * Provides consistent error response format across all routes
 */

/**
 * Standard error response codes
 * @enum {string}
 */
const ErrorCode = {
  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_OPERATION: 'INVALID_OPERATION',
  PATH_TRAVERSAL: 'PATH_TRAVERSAL',

  // Authentication/Authorization (401, 403)
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  ACCESS_DENIED: 'ACCESS_DENIED',

  // Not found (404)
  NOT_FOUND: 'NOT_FOUND',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  FLOW_NOT_FOUND: 'FLOW_NOT_FOUND',
  LAYER_NOT_FOUND: 'LAYER_NOT_FOUND',

  // Conflict (409)
  CONFLICT: 'CONFLICT',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Unprocessable entity (422)
  UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_ENCODING: 'INVALID_ENCODING',

  // Server errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  OPERATION_FAILED: 'OPERATION_FAILED',
  DISK_SPACE_ERROR: 'DISK_SPACE_ERROR'
};

/**
 * Map error codes to HTTP status codes
 * @type {Object.<string, number>}
 */
const STATUS_CODES = {
  VALIDATION_ERROR: 400,
  INVALID_INPUT: 400,
  INVALID_OPERATION: 400,
  PATH_TRAVERSAL: 403,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  ACCESS_DENIED: 403,
  NOT_FOUND: 404,
  FILE_NOT_FOUND: 404,
  TASK_NOT_FOUND: 404,
  FLOW_NOT_FOUND: 404,
  LAYER_NOT_FOUND: 404,
  CONFLICT: 409,
  ALREADY_EXISTS: 409,
  UNPROCESSABLE_ENTITY: 422,
  FILE_TOO_LARGE: 422,
  INVALID_ENCODING: 422,
  INTERNAL_ERROR: 500,
  OPERATION_FAILED: 500,
  DISK_SPACE_ERROR: 500
};

/**
 * Build standardized error response object
 * @param {string} code - Error code from ErrorCode enum
 * @param {string} message - Human-readable error message
 * @param {Object} [details] - Additional error details
 * @returns {Object} Standard error response object
 */
export function buildErrorResponse(code, message, details = {}) {
  const statusCode = STATUS_CODES[code] || 500;

  const error = {
    code,
    message,
    timestamp: new Date().toISOString()
  };

  if (Object.keys(details).length > 0) {
    error.details = details;
  }

  if (process.env.DEBUG) {
    error.debug = details;
  }

  return {
    error,
    statusCode
  };
}

/**
 * Validation error response
 * @param {string|string[]} fields - Field name(s) that failed validation
 * @param {string} [message] - Custom error message
 * @returns {Object} Error response object
 */
export function validationError(fields, message = 'Validation failed') {
  const fieldArray = Array.isArray(fields) ? fields : [fields];
  return buildErrorResponse(
    'VALIDATION_ERROR',
    message,
    { fields: fieldArray }
  );
}

/**
 * Not found error response
 * @param {string} resource - Resource type (file, task, flow, etc.)
 * @param {string} [identifier] - Resource identifier
 * @returns {Object} Error response object
 */
export function notFoundError(resource, identifier = '') {
  const code = {
    file: 'FILE_NOT_FOUND',
    task: 'TASK_NOT_FOUND',
    flow: 'FLOW_NOT_FOUND',
    layer: 'LAYER_NOT_FOUND'
  }[resource] || 'NOT_FOUND';

  const message = identifier
    ? `${resource} not found: ${identifier}`
    : `${resource} not found`;

  return buildErrorResponse(code, message, { resource, identifier });
}

/**
 * Forbidden/access denied error response
 * @param {string} reason - Reason for access denial
 * @returns {Object} Error response object
 */
export function forbiddenError(reason = 'Access denied') {
  return buildErrorResponse('FORBIDDEN', reason);
}

/**
 * Conflict error response
 * @param {string} resource - Resource type
 * @param {string} [reason] - Reason for conflict
 * @returns {Object} Error response object
 */
export function conflictError(resource, reason = 'Resource already exists') {
  return buildErrorResponse('CONFLICT', reason, { resource });
}

/**
 * Unprocessable entity error (invalid data)
 * @param {string} message - Error message
 * @param {Object} [details] - Error details
 * @returns {Object} Error response object
 */
export function unprocessableError(message, details = {}) {
  return buildErrorResponse('UNPROCESSABLE_ENTITY', message, details);
}

/**
 * Internal server error response
 * @param {string} [message] - Error message
 * @param {Error} [error] - Original error object
 * @returns {Object} Error response object
 */
export function internalError(message = 'Internal server error', error = null) {
  const details = {};
  if (error && process.env.DEBUG) {
    details.originalError = error.message;
    details.stack = error.stack?.split('\n').slice(0, 3);
  }
  return buildErrorResponse('INTERNAL_ERROR', message, details);
}

/**
 * Send error response via Express response object
 * @param {Object} res - Express response object
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} [details] - Additional details
 */
export function sendError(res, code, message, details = {}) {
  const response = buildErrorResponse(code, message, details);
  res.status(response.statusCode).json(response.error);
}

export { ErrorCode, STATUS_CODES };
