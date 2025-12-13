const ERROR_CATEGORIES = {
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  PATH_TRAVERSAL: 'PATH_TRAVERSAL',
  INVALID_INPUT: 'INVALID_INPUT',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  ENCODING_ERROR: 'ENCODING_ERROR',
  DISK_SPACE: 'DISK_SPACE',
  OPERATION_FAILED: 'OPERATION_FAILED',
  UNKNOWN: 'UNKNOWN'
};

function getErrorCategory(error) {
  const message = error.message || '';
  const code = error.code || '';

  if (code === 'ENOENT' || message.includes('not found')) {
    return ERROR_CATEGORIES.FILE_NOT_FOUND;
  }
  if (code === 'EACCES' || code === 'EPERM' || message.includes('Permission denied')) {
    return ERROR_CATEGORIES.PERMISSION_DENIED;
  }
  if (message.includes('path traversal')) {
    return ERROR_CATEGORIES.PATH_TRAVERSAL;
  }
  if (message.includes('Invalid') || message.includes('invalid')) {
    return ERROR_CATEGORIES.INVALID_INPUT;
  }
  if (message.includes('too large') || code === 'EFBIG') {
    return ERROR_CATEGORIES.FILE_TOO_LARGE;
  }
  if (message.includes('encoding') || code === 'EILSEQ') {
    return ERROR_CATEGORIES.ENCODING_ERROR;
  }
  if (code === 'ENOSPC') {
    return ERROR_CATEGORIES.DISK_SPACE;
  }

  return ERROR_CATEGORIES.UNKNOWN;
}

function getSeverity(category) {
  switch (category) {
    case ERROR_CATEGORIES.PATH_TRAVERSAL:
    case ERROR_CATEGORIES.PERMISSION_DENIED:
      return 'critical';
    case ERROR_CATEGORIES.FILE_NOT_FOUND:
    case ERROR_CATEGORIES.FILE_TOO_LARGE:
    case ERROR_CATEGORIES.DISK_SPACE:
      return 'error';
    case ERROR_CATEGORIES.ENCODING_ERROR:
    case ERROR_CATEGORIES.INVALID_INPUT:
      return 'warning';
    default:
      return 'info';
  }
}

export { ERROR_CATEGORIES, getErrorCategory, getSeverity };
