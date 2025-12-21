/**
 * @module route-helpers/request
 * Request validation helpers
 */

import { createValidationError } from '@sequentialos/error-handling';

/**
 * Ensure a resource exists in the request object
 * @param {Object} req - Express request object
 * @param {string} resourceName - Name of the resource to check
 * @throws {AppError} 400 error if resource is missing
 * @returns {any} The resource value
 */
export function requireResource(req, resourceName) {
  if (!req || typeof req !== 'object') {
    throw createValidationError('Invalid request object');
  }

  if (!resourceName || typeof resourceName !== 'string') {
    throw createValidationError('Invalid resource name');
  }

  const value = req[resourceName];

  if (value === undefined || value === null) {
    throw createValidationError(`Missing required resource: ${resourceName}`, resourceName);
  }

  return value;
}
