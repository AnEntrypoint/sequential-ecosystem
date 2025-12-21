/**
 * @module error-handling
 * TypeScript definitions for error types, factories, and utilities
 */

/**
 * Custom error class with status code support
 */
export class AppError extends Error {
  name: string;
  code: string;
  statusCode: number;
  details: Record<string, any>;

  constructor(message: string, code: string, statusCode?: number, details?: Record<string, any>);
}

/**
 * Create a validation error (400 Bad Request)
 * @param message - Error message
 * @param field - Field name that failed validation
 * @returns AppError instance
 */
export function createValidationError(message: string, field?: string | null): AppError;

/**
 * Create a not found error (404 Not Found)
 * @param message - Error message
 * @param resourceType - Type of resource not found
 * @param resourceId - Resource identifier
 * @returns AppError instance
 */
export function createNotFoundError(message: string, resourceType?: string | null, resourceId?: string | null): AppError;

/**
 * Create a forbidden error (403 Forbidden)
 * @param message - Error message
 * @param reason - Reason for access denial
 * @returns AppError instance
 */
export function createForbiddenError(message: string, reason?: string | null): AppError;

/**
 * Create a path traversal error (403 Forbidden)
 * @param path - Path that triggered the error
 * @returns AppError instance
 */
export function createPathTraversalError(path?: string | null): AppError;

/**
 * Throw a path traversal error
 * @param path - Path that triggered the error
 * @throws {AppError}
 */
export function throwPathTraversal(path: string): never;

/**
 * Create a conflict error (409 Conflict)
 * @param message - Error message
 * @param resource - Resource that conflicts
 * @returns AppError instance
 */
export function createConflictError(message: string, resource?: string | null): AppError;

/**
 * Create an unprocessable entity error (422 Unprocessable Entity)
 * @param message - Error message
 * @param reason - Reason for unprocessable entity
 * @returns AppError instance
 */
export function createUnprocessableError(message: string, reason?: string | null): AppError;

/**
 * Create an internal server error (500 Internal Server Error)
 * @param message - Error message
 * @param context - Additional context information
 * @returns AppError instance
 */
export function createInternalError(message: string, context?: Record<string, any>): AppError;

/**
 * Async handler wrapper to catch errors in route handlers
 * @param fn - Route handler function
 * @returns Wrapped route handler
 */
export function asyncHandler(
  fn: (req: any, res: any, next: any) => Promise<any>
): (req: any, res: any, next: any) => void;

/**
 * Serialized error object for safe transmission
 */
export class SerializedError {
  name: string;
  message: string;
  code: string;
  statusCode: number;
  details: Record<string, any>;
  stack: string | null;

  constructor(error: Error | AppError);
}

/**
 * Serialize an error object for safe transmission
 * @param error - Error to serialize
 * @returns Serialized error object
 */
export function serializeError(error: Error | AppError | null | undefined): SerializedError;

/**
 * Normalize any error to an AppError instance
 * @param error - Error to normalize
 * @returns Normalized AppError instance
 */
export function normalizeError(error: any): AppError;

/**
 * Get formatted stack trace from error
 * @param error - Error object
 * @param limit - Maximum number of stack frames to return
 * @returns Array of formatted stack trace lines
 */
export function getStackTrace(error: Error | AppError, limit?: number): string[];

/**
 * Get user-friendly message for error category
 * @param category - Error category code
 * @param operation - Operation that failed (optional)
 * @returns User-friendly error message
 */
export function getUserFriendlyMessage(category: string, operation?: string): string;
