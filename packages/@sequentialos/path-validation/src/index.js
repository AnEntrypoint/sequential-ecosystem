import path from 'path';
import fs from 'fs';
import { createPathTraversalError } from '@sequentialos/error-handling';

export function validateBasePath(userPath, basePath) {
  let realPath;
  try {
    realPath = fs.realpathSync(userPath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      const parentDir = path.dirname(userPath);
      try {
        const realParent = fs.realpathSync(parentDir);
        realPath = path.join(realParent, path.basename(userPath));
      } catch (parentErr) {
        realPath = userPath;
      }
    } else {
      throw createPathTraversalError(userPath);
    }
  }

  let realBasePath;
  try {
    realBasePath = fs.realpathSync(basePath);
  } catch (err) {
    throw createPathTraversalError(basePath);
  }

  const normalizedBase = realBasePath.endsWith(path.sep) ? realBasePath : realBasePath + path.sep;
  if (!realPath.startsWith(normalizedBase) && realPath !== realBasePath) {
    throw createPathTraversalError(realPath);
  }

  return realPath;
}

export function resolveSecurePath(basePath, relativePath) {
  const fullPath = path.join(basePath, relativePath);
  return validateBasePath(fullPath, basePath);
}
