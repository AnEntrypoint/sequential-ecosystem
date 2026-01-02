/**
 * Standard error response codes
 */
export declare const ErrorCode: {
  VALIDATION_ERROR: 'VALIDATION_ERROR';
  INVALID_INPUT: 'INVALID_INPUT';
  INVALID_OPERATION: 'INVALID_OPERATION';
  PATH_TRAVERSAL: 'PATH_TRAVERSAL';
  UNAUTHORIZED: 'UNAUTHORIZED';
  FORBIDDEN: 'FORBIDDEN';
  ACCESS_DENIED: 'ACCESS_DENIED';
  NOT_FOUND: 'NOT_FOUND';
  FILE_NOT_FOUND: 'FILE_NOT_FOUND';
  TASK_NOT_FOUND: 'TASK_NOT_FOUND';
  FLOW_NOT_FOUND: 'FLOW_NOT_FOUND';
  LAYER_NOT_FOUND: 'LAYER_NOT_FOUND';
  CONFLICT: 'CONFLICT';
  ALREADY_EXISTS: 'ALREADY_EXISTS';
  UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY';
  FILE_TOO_LARGE: 'FILE_TOO_LARGE';
  INVALID_ENCODING: 'INVALID_ENCODING';
  INTERNAL_ERROR: 'INTERNAL_ERROR';
  OPERATION_FAILED: 'OPERATION_FAILED';
  DISK_SPACE_ERROR: 'DISK_SPACE_ERROR';
};

/**
 * Map error codes to HTTP status codes
 */
export declare const STATUS_CODES: Record<string, number>;

/**
 * Standard error response object
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    timestamp: string;
    details?: Record<string, any>;
    debug?: Record<string, any>;
  };
  statusCode: number;
}

/**
 * Build standardized error response object
 * @param code Error code from ErrorCode enum
 * @param message Human-readable error message
 * @param details Additional error details
 * @returns Standard error response object
 */
export declare function buildErrorResponse(
  code: string,
  message: string,
  details?: Record<string, any>
): ErrorResponse;

/**
 * Send error response via Express response object
 * @param res Express response object
 * @param code Error code
 * @param message Error message
 * @param details Additional details
 */
export declare function sendError(
  res: any,
  code: string,
  message: string,
  details?: Record<string, any>
): void;
