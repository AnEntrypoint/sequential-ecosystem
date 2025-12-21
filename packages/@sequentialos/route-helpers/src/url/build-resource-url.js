/**
 * @module route-helpers/url
 * URL building helpers
 */

import { createValidationError } from '@sequentialos/error-handling';

/**
 * Build resource-specific URL
 * @param {string} baseUrl - Base URL (e.g., '/api/tasks')
 * @param {string} resourceId - Resource ID to append
 * @returns {string} Complete resource URL
 */
export function buildResourceUrl(baseUrl, resourceId) {
  if (!baseUrl || typeof baseUrl !== 'string') {
    throw createValidationError('Invalid base URL');
  }

  if (!resourceId) {
    return baseUrl;
  }

  // Ensure baseUrl doesn't end with slash
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  // Ensure resourceId doesn't start with slash
  const cleanId = String(resourceId).startsWith('/')
    ? String(resourceId).slice(1)
    : String(resourceId);

  return `${cleanBase}/${cleanId}`;
}
