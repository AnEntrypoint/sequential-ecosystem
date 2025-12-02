import path from 'path';
import { createServerError } from '@sequential/error-handling';

export function validateAndResolvePath(filePath, baseDir = null) {
  if (!filePath) {
    throw createServerError('File path required');
  }

  const realPath = path.resolve(filePath);
  const boundary = baseDir || process.cwd();

  if (!realPath.startsWith(boundary)) {
    throw createServerError('Path traversal not allowed');
  }

  return realPath;
}

export function createTimer() {
  const startTime = Date.now();
  return {
    elapsed: () => Date.now() - startTime
  };
}
