/**
 * Error category enumeration for file operation errors
 * @enum {string}
 */
const ERROR_CATEGORIES = {
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  PATH_TRAVERSAL: 'PATH_TRAVERSAL',
  INVALID_INPUT: 'INVALID_INPUT',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  ENCODING_ERROR: 'ENCODING_ERROR',
  DISK_SPACE: 'DISK_SPACE',
  OPERATION_FAILED: 'OPERATION_FAILED',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Categorize an error based on error code and message
 * @param {Error} error - The error object to categorize
 * @returns {string} The error category from ERROR_CATEGORIES
 * @private
 */
function categorizeError(error) {
  const message = error.message || '';
  const code = error.code || '';

  if (code === 'ENOENT' || message.includes('not found')) {
    return ERROR_CATEGORIES.FILE_NOT_FOUND;
  }
  if (code === 'EACCES' || code === 'EPERM' || message.includes('Permission denied')) {
    return ERROR_CATEGORIES.PERMISSION_DENIED;
  }
  if (message.includes('path traversal')) {
    return ERROR_CATEGORIES.PATH_TRAVERSAL;
  }
  if (message.includes('Invalid') || message.includes('invalid')) {
    return ERROR_CATEGORIES.INVALID_INPUT;
  }
  if (message.includes('too large') || code === 'EFBIG') {
    return ERROR_CATEGORIES.FILE_TOO_LARGE;
  }
  if (message.includes('encoding') || code === 'EILSEQ') {
    return ERROR_CATEGORIES.ENCODING_ERROR;
  }
  if (code === 'ENOSPC') {
    return ERROR_CATEGORIES.DISK_SPACE;
  }

  return ERROR_CATEGORIES.UNKNOWN;
}

/**
 * Extract stack trace lines from an error
 * @param {Error} error - The error object
 * @param {number} [limit=5] - Maximum number of stack frames to extract
 * @returns {string[]} Array of stack trace lines
 * @private
 */
function getStackTrace(error, limit = 5) {
  if (!error.stack) return [];
  return error.stack.split('\n').slice(1, limit + 1).map(line => line.trim());
}

/**
 * Determine severity level based on error category
 * @param {string} category - Error category from ERROR_CATEGORIES
 * @returns {string} One of: 'critical', 'error', 'warning', 'info'
 * @private
 */
function getSeverity(category) {
  switch (category) {
    case ERROR_CATEGORIES.PATH_TRAVERSAL:
    case ERROR_CATEGORIES.PERMISSION_DENIED:
      return 'critical';
    case ERROR_CATEGORIES.FILE_NOT_FOUND:
    case ERROR_CATEGORIES.FILE_TOO_LARGE:
    case ERROR_CATEGORIES.DISK_SPACE:
      return 'error';
    case ERROR_CATEGORIES.ENCODING_ERROR:
    case ERROR_CATEGORIES.INVALID_INPUT:
      return 'warning';
    default:
      return 'info';
  }
}

/**
 * Get a user-friendly error message for an error category
 * @param {string} category - Error category from ERROR_CATEGORIES
 * @param {string} operation - The file operation being performed (e.g., 'read', 'write')
 * @returns {string} User-friendly error message
 * @private
 */
function getUserFriendlyMessage(category, operation) {
  const messages = {
    FILE_NOT_FOUND: 'Could not find the specified file or directory',
    PERMISSION_DENIED: `You do not have permission to ${operation} this file`,
    PATH_TRAVERSAL: 'Access denied: invalid file path',
    INVALID_INPUT: 'Invalid file path or parameters provided',
    FILE_TOO_LARGE: `File is too large to ${operation}`,
    ENCODING_ERROR: 'Unable to read file: encoding error',
    DISK_SPACE: 'Insufficient disk space for this operation',
    OPERATION_FAILED: 'File operation failed. Please try again',
    UNKNOWN: 'An unexpected error occurred during file operation'
  };

  return messages[category] || messages.UNKNOWN;
}

/**
 * Serializable error wrapper class
 * Converts Error objects into JSON-serializable form
 */
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

/**
 * Serialize an error object into a SerializedError
 * @param {Error} error - The error to serialize
 * @returns {SerializedError} Serialized error object
 */
export function serializeError(error) {
  if (error instanceof SerializedError) return error;
  return new SerializedError(error);
}

/**
 * Normalize any value into a SerializedError
 * @param {any} error - Error object, Error, or any value
 * @returns {SerializedError|null} Normalized error or null
 */
export function normalizeError(error) {
  if (!error) return null;
  if (error instanceof Error) return serializeError(error);
  if (typeof error === 'object') return new SerializedError(error);
  return new SerializedError(new Error(String(error)));
}

/**
 * Log a file operation error with categorization
 * @param {string} operation - Operation name (e.g., 'read', 'write', 'delete')
 * @param {string} filePath - Path to the file being operated on
 * @param {Error} error - The error that occurred
 * @param {Object} [context={}] - Additional context information
 * @returns {Object} Log entry object with timestamp, category, severity
 */
export function logFileOperation(operation, filePath, error, context = {}) {
  const category = categorizeError(error);
  const timestamp = new Date().toISOString();
  const stackTrace = getStackTrace(error);

  const logEntry = {
    timestamp,
    operation,
    category,
    filePath,
    error: {
      message: error.message || 'Unknown error',
      code: error.code || null,
      stack: stackTrace
    },
    context,
    severity: getSeverity(category)
  };

  if (process.env.DEBUG || category === ERROR_CATEGORIES.PATH_TRAVERSAL) {
    console.error(`[FileOp:${category}] ${operation} failed on ${filePath}:`, logEntry);
  }

  return logEntry;
}

/**
 * Log a successful file operation
 * @param {string} operation - Operation name (e.g., 'read', 'write', 'delete')
 * @param {string} filePath - Path to the file that was operated on
 * @param {number} [duration=0] - Time taken for the operation in milliseconds
 * @param {Object} [metadata={}] - Additional metadata about the operation
 * @returns {Object} Log entry object with success status and timing
 */
export function logFileSuccess(operation, filePath, duration = 0, metadata = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    status: 'success',
    filePath,
    durationMs: duration,
    metadata,
    severity: 'info'
  };

  if (process.env.DEBUG) {
    console.log(`[FileOp:Success] ${operation} completed in ${duration}ms`);
  }

  return logEntry;
}

/**
 * Log a batch file operation
 * @param {string} operation - Batch operation name
 * @param {number} fileCount - Number of files in the batch
 * @param {Error|null} error - Error if operation failed, null for success
 * @param {number} [duration=0] - Time taken for the operation in milliseconds
 * @returns {Object} Log entry object with batch operation details
 */
export function logBatchFileOperation(operation, fileCount, error, duration = 0) {
  const category = error ? categorizeError(error) : 'SUCCESS';
  const timestamp = new Date().toISOString();

  const logEntry = {
    timestamp,
    operation,
    category,
    fileCount,
    durationMs: duration,
    error: error ? {
      message: error.message || 'Unknown error',
      code: error.code || null
    } : null,
    severity: error ? getSeverity(category) : 'info'
  };

  if (process.env.DEBUG || error) {
    console.log(`[FileOp:Batch] ${operation} on ${fileCount} files:`, logEntry);
  }

  return logEntry;
}

/**
 * Create a detailed error response for HTTP responses
 * Includes categorization, user-friendly message, and debug details if DEBUG is enabled
 * @param {string} operation - Operation name that was being performed
 * @param {string} filePath - Path to the file involved in the error
 * @param {Error} error - The error that occurred
 * @param {number} [statusCode=500] - HTTP status code for the response
 * @returns {Object} Error response object with error details and statusCode
 */
export function createDetailedErrorResponse(operation, filePath, error, statusCode = 500) {
  const category = categorizeError(error);
  const userMessage = getUserFriendlyMessage(category, operation);

  return {
    error: {
      code: category,
      message: userMessage,
      operation,
      filePath,
      timestamp: new Date().toISOString(),
      ...(process.env.DEBUG && {
        details: {
          originalError: error.message,
          errorCode: error.code,
          stack: getStackTrace(error, 3)
        }
      })
    },
    statusCode
  };
}

export const ErrorCategories = ERROR_CATEGORIES;
