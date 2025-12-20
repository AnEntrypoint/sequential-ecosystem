/**
 * error-responses.js - Error Response Facade
 *
 * Delegates to focused modules:
 * - error-codes: Error codes and status code mapping
 * - error-builder: Core error response building
 * - error-factories: Specific error type factories
 * - error-sender: Send errors via Express
 */

export { ErrorCode, STATUS_CODES } from './error-codes.js';
export { buildErrorResponse } from './error-builder.js';
export {
  validationError,
  notFoundError,
  forbiddenError,
  conflictError,
  unprocessableError,
  internalError
} from './error-factories.js';
export { sendError } from './error-sender.js';
