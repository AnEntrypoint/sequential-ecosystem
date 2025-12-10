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

export function serializeError(error) {
  if (error instanceof SerializedError) return error;
  return new SerializedError(error);
}

export function normalizeError(error) {
  if (!error) return null;
  if (error instanceof Error) return serializeError(error);
  if (typeof error === 'object') return new SerializedError(error);
  return new SerializedError(new Error(String(error)));
}

export { getStackTrace, getUserFriendlyMessage };
