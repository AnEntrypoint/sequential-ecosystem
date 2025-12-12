/**
 * error-logger.js - Error Logging Facade
 *
 * Delegates to focused modules:
 * - error-categories: Error categorization and severity
 * - error-logging: File operation logging
 * - error-response: Error response formatting
 */

export { ERROR_CATEGORIES as ErrorCategories, getErrorCategory, getSeverity } from './error-categories.js';
export { logFileOperation, logFileSuccess, logBatchFileOperation } from './error-logging.js';
export { createDetailedErrorResponse } from './error-response.js';
