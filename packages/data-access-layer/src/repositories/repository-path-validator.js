import { validatePath } from '@sequentialos/validation';

/**
 * repository-path-validator.js
 *
 * Path validation with symlink protection for repositories
 * Prevents directory traversal attacks
 */

export function createPathValidator(entityName = 'Entity') {
  return {
    /**
     * validatePath - Prevents directory traversal attacks
     *
     * Resolves symlinks and verifies path stays within baseDir
     * Throws 403 Forbidden if path escapes baseDir
     *
     * @param {string} id - Entity identifier (directory name or file name)
     * @param {string} baseDir - Base directory path
     * @returns {string} - Validated, resolved path
     * @throws {Error} - 403 if path traversal detected
     */
    validatePath(id, baseDir) {
      try {
        return validatePath(id, baseDir);
      } catch (err) {
        if (err.code === 'FORBIDDEN' || err.code === 'VALIDATION_ERROR') {
          const error = new Error(`Access to ${entityName.toLowerCase()} '${id}' denied`);
          error.status = err.status || 403;
          error.code = 'FORBIDDEN';
          throw error;
        }
        throw err;
      }
    }
  };
}
