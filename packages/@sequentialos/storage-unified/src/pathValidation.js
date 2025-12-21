/**
 * Path validation utilities for secure filesystem operations
 */

import fs from 'fs-extra';
import path from 'path';
import { createPathTraversalError } from '@sequentialos/error-handling';

/**
 * Validate a path is within the allowed base path
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
