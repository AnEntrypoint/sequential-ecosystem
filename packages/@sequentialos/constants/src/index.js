/**
 * @module constants
 * Centralized constants for Sequential OS
 */

/**
 * Default port numbers for services
 */
export const PORT_DEFAULTS = {
  DESKTOP_SERVER: 8003,
  DENO_EXECUTOR: 3100,
  STACK_PROCESSOR: 3101,
  TASK_EXECUTOR: 3102,
  GAPI: 3103,
  KEYSTORE: 3104,
  SUPABASE: 3105,
  OPENAI: 3106,
  WEBSEARCH: 3107,
  ADMIN_DEBUG: 3108
};

/**
 * Default timeout values in milliseconds
 */
export const TIMEOUT_DEFAULTS = {
  SERVICE_CALL: 30000,
  EXTERNAL_API: 30000,
  EXECUTION: 30000,
  RECONNECT: 3000,
  HEALTH_CHECK: 5000,
  WEBSOCKET_PING: 5000,
  HTTP_REQUEST: 30000,
  HTTP_RESPONSE: 30000,
  LOCK: 60000
};

/**
 * Size and limit constants
 */
export const SIZE_LIMITS = {
  JSON_BODY: '50mb',
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100 MB
  MAX_PAGINATION_LIMIT: 100,
  DEFAULT_PAGINATION_LIMIT: 50,
  DEFAULT_PAGINATION_OFFSET: 0
};

/**
 * Retry configuration constants
 */
export const RETRY_DEFAULTS = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 30000,
  BACKOFF_MULTIPLIER: 2,
  JITTER_FRACTION: 0.1
};

/**
 * Cache TTL constants in milliseconds
 */
export const CACHE_TTL = {
  DEFAULT: 300000, // 5 minutes
  KEYSTORE: 3600000, // 1 hour
  TOKEN_REFRESH_BUFFER: 300000 // 5 minutes
};

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * Error template functions for common error scenarios
 */
export const ERROR_TEMPLATES = {
  /**
   * Create a validation error response
   * @param {string} message - Error message
   * @param {string|null} field - Field name that failed validation
   * @returns {object} Error response object
   */
  validation: (message, field = null) => ({
    success: false,
    error: message,
    field,
    code: 'VALIDATION_ERROR',
    status: HTTP_STATUS.BAD_REQUEST
  }),

  /**
   * Create a not found error response
   * @param {string} resource - Resource type (e.g., 'Task', 'File')
   * @param {string|null} identifier - Resource identifier
   * @returns {object} Error response object
   */
  notFound: (resource, identifier = null) => ({
    success: false,
    error: identifier
      ? `${resource} not found: ${identifier}`
      : `${resource} not found`,
    code: 'NOT_FOUND',
    status: HTTP_STATUS.NOT_FOUND
  }),

  /**
   * Create an unauthorized error response
   * @param {string} message - Error message
   * @returns {object} Error response object
   */
  unauthorized: (message = 'Unauthorized access') => ({
    success: false,
    error: message,
    code: 'UNAUTHORIZED',
    status: HTTP_STATUS.UNAUTHORIZED
  }),

  /**
   * Create a forbidden error response
   * @param {string} message - Error message
   * @returns {object} Error response object
   */
  forbidden: (message = 'Forbidden') => ({
    success: false,
    error: message,
    code: 'FORBIDDEN',
    status: HTTP_STATUS.FORBIDDEN
  }),

  /**
   * Create a conflict error response
   * @param {string} message - Error message
   * @returns {object} Error response object
   */
  conflict: (message) => ({
    success: false,
    error: message,
    code: 'CONFLICT',
    status: HTTP_STATUS.CONFLICT
  }),

  /**
   * Create a service unavailable error response
   * @param {string} service - Service name
   * @returns {object} Error response object
   */
  serviceUnavailable: (service) => ({
    success: false,
    error: `${service} is currently unavailable`,
    code: 'SERVICE_UNAVAILABLE',
    status: HTTP_STATUS.SERVICE_UNAVAILABLE
  }),

  /**
   * Create an internal server error response
   * @param {string} message - Error message (never include stack traces)
   * @returns {object} Error response object
   */
  internal: (message = 'Internal server error') => ({
    success: false,
    error: message,
    code: 'INTERNAL_ERROR',
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR
  }),

  /**
   * Create a timeout error response
   * @param {string} operation - Operation that timed out
   * @returns {object} Error response object
   */
  timeout: (operation) => ({
    success: false,
    error: `${operation} timed out`,
    code: 'TIMEOUT',
    status: HTTP_STATUS.REQUEST_TIMEOUT || 408
  }),

  /**
   * Create a generic error response
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {number} status - HTTP status code
   * @returns {object} Error response object
   */
  generic: (message, code = 'ERROR', status = HTTP_STATUS.INTERNAL_SERVER_ERROR) => ({
    success: false,
    error: message,
    code,
    status
  })
};

/**
 * Log level constants
 */
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

/**
 * Environment names
 */
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test'
};

/**
 * Common CORS settings
 */
export const CORS_DEFAULTS = {
  ORIGIN: '*',
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  ALLOWED_HEADERS: ['Content-Type', 'Authorization']
};

/**
 * Default host/listen address
 */
export const DEFAULT_HOST = 'localhost';

export default {
  PORT_DEFAULTS,
  TIMEOUT_DEFAULTS,
  SIZE_LIMITS,
  RETRY_DEFAULTS,
  CACHE_TTL,
  HTTP_STATUS,
  ERROR_TEMPLATES,
  LOG_LEVELS,
  ENVIRONMENTS,
  CORS_DEFAULTS,
  DEFAULT_HOST
};
