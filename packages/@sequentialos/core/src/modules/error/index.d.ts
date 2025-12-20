/**
 * Error categories for file operation errors
 */
export declare const ErrorCategories: {
  FILE_NOT_FOUND: 'FILE_NOT_FOUND';
  PERMISSION_DENIED: 'PERMISSION_DENIED';
  PATH_TRAVERSAL: 'PATH_TRAVERSAL';
  INVALID_INPUT: 'INVALID_INPUT';
  FILE_TOO_LARGE: 'FILE_TOO_LARGE';
  ENCODING_ERROR: 'ENCODING_ERROR';
  DISK_SPACE: 'DISK_SPACE';
  OPERATION_FAILED: 'OPERATION_FAILED';
  UNKNOWN: 'UNKNOWN';
};

/**
 * Serializable error wrapper class
 * Converts Error objects into JSON-serializable form
 */
export declare class SerializedError {
  message: string;
  name: string;
  stack: string;
  code: string | null;

  constructor(error: Error | { message?: string; name?: string; stack?: string; code?: string });

  toJSON(): {
    message: string;
    name: string;
    stack: string;
    code: string | null;
  };

  toString(): string;
}

/**
 * Serialize an error object into a SerializedError
 * @param error The error to serialize
 * @returns Serialized error object
 */
export declare function serializeError(error: Error): SerializedError;

/**
 * Normalize any value into a SerializedError
 * @param error Error object, Error, or any value
 * @returns Normalized error or null
 */
export declare function normalizeError(error: any): SerializedError | null;

/**
 * Log a file operation error with categorization
 * @param operation Operation name (e.g., 'read', 'write', 'delete')
 * @param filePath Path to the file being operated on
 * @param error The error that occurred
 * @param context Additional context information
 * @returns Log entry object with timestamp, category, severity
 */
export declare function logFileOperation(
  operation: string,
  filePath: string,
  error: Error,
  context?: Record<string, any>
): {
  timestamp: string;
  operation: string;
  category: string;
  filePath: string;
  error: {
    message: string;
    code: string | null;
    stack: string[];
  };
  context: Record<string, any>;
  severity: 'critical' | 'error' | 'warning' | 'info';
};

/**
 * Log a successful file operation
 * @param operation Operation name (e.g., 'read', 'write', 'delete')
 * @param filePath Path to the file that was operated on
 * @param duration Time taken for the operation in milliseconds
 * @param metadata Additional metadata about the operation
 * @returns Log entry object with success status and timing
 */
export declare function logFileSuccess(
  operation: string,
  filePath: string,
  duration?: number,
  metadata?: Record<string, any>
): {
  timestamp: string;
  operation: string;
  status: 'success';
  filePath: string;
  durationMs: number;
  metadata: Record<string, any>;
  severity: 'info';
};

/**
 * Log a batch file operation
 * @param operation Batch operation name
 * @param fileCount Number of files in the batch
 * @param error Error if operation failed, null for success
 * @param duration Time taken for the operation in milliseconds
 * @returns Log entry object with batch operation details
 */
export declare function logBatchFileOperation(
  operation: string,
  fileCount: number,
  error: Error | null,
  duration?: number
): {
  timestamp: string;
  operation: string;
  category: string;
  fileCount: number;
  durationMs: number;
  error: { message: string; code: string | null } | null;
  severity: 'critical' | 'error' | 'warning' | 'info';
};

/**
 * Create a detailed error response for HTTP responses
 * Includes categorization, user-friendly message, and debug details if DEBUG is enabled
 * @param operation Operation name that was being performed
 * @param filePath Path to the file involved in the error
 * @param error The error that occurred
 * @param statusCode HTTP status code for the response
 * @returns Error response object with error details and statusCode
 */
export declare function createDetailedErrorResponse(
  operation: string,
  filePath: string,
  error: Error,
  statusCode?: number
): {
  error: {
    code: string;
    message: string;
    operation: string;
    filePath: string;
    timestamp: string;
    details?: {
      originalError: string;
      errorCode: string | null;
      stack: string[];
    };
  };
  statusCode: number;
};
