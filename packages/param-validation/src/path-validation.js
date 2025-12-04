import path from 'path';
import fs from 'fs';

export function validatePath(filePath, basePath) {
  if (!filePath || typeof filePath !== 'string') {
    const err = new Error('Invalid file path');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const fullPath = basePath ? path.join(basePath, filePath) : path.resolve(filePath);
  const baseReal = basePath ? (fs.existsSync(basePath) ? fs.realpathSync(basePath) : basePath) : path.resolve(process.cwd());

  let realPath;
  try {
    realPath = fs.realpathSync(path.resolve(fullPath));
  } catch (err) {
    if (err.code === 'ENOENT') {
      const parentDir = path.dirname(fullPath);
      try {
        const realParent = fs.realpathSync(path.resolve(parentDir));
        realPath = path.join(realParent, path.basename(fullPath));
      } catch (parentErr) {
        realPath = path.resolve(fullPath);
      }
    } else {
      const error = new Error('Access denied: cannot access file system');
      error.status = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }
  }

  if (!realPath.startsWith(baseReal + path.sep) && realPath !== baseReal) {
    const err = new Error('Access denied: path traversal detected');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  return basePath ? fullPath : realPath;
}

export function validatePathRelative(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    const err = new Error('Invalid file path');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const normalizedPath = path.resolve(filePath);
  const cwd = path.resolve(process.cwd());

  let realPath;
  try {
    realPath = fs.realpathSync(normalizedPath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      const parentDir = path.dirname(normalizedPath);
      try {
        const realParent = fs.realpathSync(parentDir);
        realPath = path.join(realParent, path.basename(normalizedPath));
      } catch (parentErr) {
        realPath = normalizedPath;
      }
    } else {
      const error = new Error('Access denied: cannot access file system');
      error.status = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }
  }

  const relative = path.relative(cwd, realPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    const err = new Error('Access denied: path traversal detected');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  return realPath;
}
