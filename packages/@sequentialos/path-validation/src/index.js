import path from 'path';
import fs from 'fs';
import { createPathTraversalError } from '@sequentialos/error-handling';

/**
 * Validate a path is within the allowed base path
 * This is the primary validation function used by storage operations
 *
 * @param {string} userPath - User-provided path to validate
 * @param {string} basePath - Base path to restrict access to
 * @returns {string} Validated absolute path
 * @throws {Error} If path traversal is detected
 */
export function validateSecurePath(userPath, basePath) {
  try {
    const resolved = fs.realpathSync(userPath);
    const baseResolved = fs.realpathSync(basePath);
    const normalizedBase = baseResolved.endsWith(path.sep) ? baseResolved : baseResolved + path.sep;

    if (!resolved.startsWith(normalizedBase) && resolved !== baseResolved) {
      throw createPathTraversalError(userPath);
    }
    return resolved;
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Path doesn't exist yet, validate the normalized path
      const normalized = path.normalize(path.resolve(basePath, userPath));
      const baseResolved = fs.realpathSync(basePath);
      const normalizedBase = baseResolved.endsWith(path.sep) ? baseResolved : baseResolved + path.sep;
      if (!normalized.startsWith(normalizedBase)) {
        throw createPathTraversalError(userPath);
      }
      return normalized;
    }
    throw err;
  }
}

/**
 * Legacy function - validates a path against a base path
 * Uses fs.realpathSync for existing paths, falls back to parent directory validation
 *
 * @param {string} userPath - User-provided path to validate
 * @param {string} basePath - Base path to restrict access to
 * @returns {string} Validated absolute path
 * @throws {Error} If path traversal is detected
 */
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

/**
 * Resolve a relative path securely within a base directory
 *
 * @param {string} basePath - Base directory path
 * @param {string} relativePath - Relative path to resolve
 * @returns {string} Validated absolute path
 * @throws {Error} If path traversal is detected
 */
export function resolveSecurePath(basePath, relativePath) {
  const fullPath = path.join(basePath, relativePath);
  return validateBasePath(fullPath, basePath);
}
