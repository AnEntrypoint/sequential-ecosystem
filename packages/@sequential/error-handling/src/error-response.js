/**
 * error-response.js - Error response formatting
 *
 * Creates user-friendly error responses with appropriate HTTP status codes
 */

import { nowISO } from '@sequentialos/timestamp-utilities';
import { getErrorCategory, ERROR_CATEGORIES } from './error-categories.js';

function getStackTrace(error, limit = 5) {
  if (!error.stack) return [];
  return error.stack.split('\n').slice(1, limit + 1).map(line => line.trim());
}

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

export function createDetailedErrorResponse(operation, filePath, error, statusCode = 500) {
  const category = getErrorCategory(error);
  const userMessage = getUserFriendlyMessage(category, operation);

  return {
    error: {
      code: category,
      message: userMessage,
      operation,
      filePath,
      timestamp: nowISO(),
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
