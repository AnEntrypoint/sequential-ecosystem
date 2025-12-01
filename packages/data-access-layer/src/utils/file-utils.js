import path from 'path';
import fs from 'fs';

export function validateFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    const err = new Error('Invalid file path');
    err.status = 400;
    err.code = 'INVALID_PATH';
    throw err;
  }

  const normalizedPath = path.resolve(filePath);
  const cwd = path.resolve(process.cwd());

  let realPath;
  try {
    realPath = fs.realpathSync(normalizedPath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      realPath = normalizedPath;
    } else {
      const error = new Error('Access denied: cannot access file system');
      error.status = 403;
      error.code = 'ACCESS_DENIED';
      throw error;
    }
  }

  const relative = path.relative(cwd, realPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    const err = new Error('Access denied: path traversal detected');
    err.status = 403;
    err.code = 'PATH_TRAVERSAL';
    throw err;
  }

  return realPath;
}

export function validateFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    const err = new Error('Invalid file name');
    err.status = 400;
    err.code = 'INVALID_NAME';
    throw err;
  }

  if (fileName.includes('/') || fileName.includes('\\') || fileName.startsWith('.')) {
    const err = new Error('File name contains invalid characters');
    err.status = 400;
    err.code = 'INVALID_CHARS';
    throw err;
  }

  if (fileName.length > 255) {
    const err = new Error('File name too long (max 255 characters)');
    err.status = 400;
    err.code = 'NAME_TOO_LONG';
    throw err;
  }

  return fileName;
}
