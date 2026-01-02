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
