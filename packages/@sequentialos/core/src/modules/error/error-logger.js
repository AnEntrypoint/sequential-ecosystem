import { getErrorCategory, getSeverity, ERROR_CATEGORIES } from './error-categories.js';
import { getStackTrace, getUserFriendlyMessage } from './error-serializer.js';
import { nowISO, createTimestamps, updateTimestamp } from '@sequentialos/timestamp-utilities';

export function logFileOperation(operation, filePath, error, context = {}) {
  const category = getErrorCategory(error);
  const timestamp = nowISO();
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

export function logFileSuccess(operation, filePath, duration = 0, metadata = {}) {
  const logEntry = {
    timestamp: nowISO(),
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

export function logBatchFileOperation(operation, fileCount, error, duration = 0) {
  const category = error ? getErrorCategory(error) : 'SUCCESS';
  const timestamp = nowISO();

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
