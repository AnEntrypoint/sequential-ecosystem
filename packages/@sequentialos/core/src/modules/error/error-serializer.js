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

export { SerializedError, serializeError, normalizeError } from '@sequentialos/error-handling';
export { getStackTrace } from '@sequentialos/error-handling';
export { getUserFriendlyMessage };
