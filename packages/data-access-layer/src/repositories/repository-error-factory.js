/**
 * repository-error-factory.js
 *
 * Factory for consistent error objects with status codes
 */

export function createErrorFactory(entityName = 'Entity') {
  return {
    /**
     * createError - Factory for consistent error objects
     *
     * @param {string} message - Error message
     * @param {number} status - HTTP status code (default: 500)
     * @param {string} code - Error code (default: 'SERVER_ERROR')
     * @returns {Error}
     */
    createError(message, status = 500, code = 'SERVER_ERROR') {
      const err = new Error(message);
      err.status = status;
      err.code = code;
      return err;
    }
  };
}
