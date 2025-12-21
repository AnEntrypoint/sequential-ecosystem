import { getErrorCategory } from './error-categories.js';
import { getStackTrace, getUserFriendlyMessage } from './error-serializer.js';
import { nowISO } from '@sequentialos/timestamp-utilities';

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
