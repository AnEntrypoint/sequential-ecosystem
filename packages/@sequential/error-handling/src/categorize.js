export const ErrorCategory = {
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  PATH_TRAVERSAL: 'PATH_TRAVERSAL',
  INVALID_INPUT: 'INVALID_INPUT',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  ENCODING_ERROR: 'ENCODING_ERROR',
  DISK_SPACE: 'DISK_SPACE',
  OPERATION_FAILED: 'OPERATION_FAILED',
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN: 'UNKNOWN'
};

export const ErrorSeverity = {
  CRITICAL: 'critical',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export function getErrorCategory(error) {
  if (!error) return ErrorCategory.UNKNOWN;

  const message = String(error.message || '').toLowerCase();
  const code = error.code || '';

  if (code === 'ENOENT' || message.includes('not found')) {
    return ErrorCategory.FILE_NOT_FOUND;
  }
  if (code === 'EACCES' || code === 'EPERM' || message.includes('permission')) {
    return ErrorCategory.PERMISSION_DENIED;
  }
  if (message.includes('traversal') || message.includes('..')) {
    return ErrorCategory.PATH_TRAVERSAL;
  }
  if (message.includes('timeout')) {
    return ErrorCategory.TIMEOUT;
  }
  if (code === 'EFBIG' || message.includes('too large')) {
    return ErrorCategory.FILE_TOO_LARGE;
  }
  if (code === 'ENOSPC' || message.includes('disk space')) {
    return ErrorCategory.DISK_SPACE;
  }
  if (code === 'EILSEQ' || message.includes('encoding')) {
    return ErrorCategory.ENCODING_ERROR;
  }
  if (message.includes('network') || message.includes('econnrefused')) {
    return ErrorCategory.NETWORK_ERROR;
  }
  if (message.includes('invalid') || message.includes('bad')) {
    return ErrorCategory.INVALID_INPUT;
  }

  return ErrorCategory.UNKNOWN;
}

export function getSeverity(category) {
  const criticalCategories = [ErrorCategory.PATH_TRAVERSAL, ErrorCategory.PERMISSION_DENIED];
  const errorCategories = [ErrorCategory.FILE_NOT_FOUND, ErrorCategory.FILE_TOO_LARGE, ErrorCategory.DISK_SPACE];
  const warningCategories = [ErrorCategory.ENCODING_ERROR, ErrorCategory.INVALID_INPUT, ErrorCategory.TIMEOUT];

  if (criticalCategories.includes(category)) {
    return ErrorSeverity.CRITICAL;
  }
  if (errorCategories.includes(category)) {
    return ErrorSeverity.ERROR;
  }
  if (warningCategories.includes(category)) {
    return ErrorSeverity.WARNING;
  }

  return ErrorSeverity.INFO;
}

export function getUserFriendlyMessage(category, operation = 'operation') {
  const messages = {
    [ErrorCategory.FILE_NOT_FOUND]: 'The file or directory could not be found.',
    [ErrorCategory.PERMISSION_DENIED]: `You do not have permission to perform this ${operation}.`,
    [ErrorCategory.PATH_TRAVERSAL]: 'Invalid path detected. Directory traversal is not allowed.',
    [ErrorCategory.INVALID_INPUT]: 'The input provided is invalid. Please check your parameters.',
    [ErrorCategory.FILE_TOO_LARGE]: 'The file is too large to process.',
    [ErrorCategory.ENCODING_ERROR]: 'There was an encoding error processing the file.',
    [ErrorCategory.DISK_SPACE]: `Not enough disk space available to complete this ${operation}.`,
    [ErrorCategory.TIMEOUT]: `The ${operation} took too long and was cancelled.`,
    [ErrorCategory.NETWORK_ERROR]: 'A network error occurred. Please check your connection.',
    [ErrorCategory.OPERATION_FAILED]: `The ${operation} failed unexpectedly.`,
    [ErrorCategory.UNKNOWN]: 'An unknown error occurred.'
  };

  return messages[category] || messages[ErrorCategory.UNKNOWN];
}
