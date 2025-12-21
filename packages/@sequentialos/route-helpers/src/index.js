/**
 * @module route-helpers
 * Route helper utilities for Express routes in Sequential OS
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

/**
 * Parse pagination parameters from query string
 * @param {Object} query - Express req.query object
 * @returns {Object} {page: number, pageSize: number, offset: number}
 */
export function parsePagination(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 20));
  const offset = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    offset
  };
}

/**
 * Normalize ID format (kebab-case to snake_case or vice versa)
 * @param {string} id - ID to normalize
 * @param {string} format - Target format: 'snake_case' or 'kebab-case' (default: 'kebab-case')
 * @returns {string} Normalized ID
 */
export function normalizeId(id, format = 'kebab-case') {
  if (!id || typeof id !== 'string') {
    return id;
  }

  if (format === 'snake_case') {
    // Convert kebab-case to snake_case
    return id.replace(/-/g, '_');
  } else if (format === 'kebab-case') {
    // Convert snake_case to kebab-case
    return id.replace(/_/g, '-');
  }

  return id;
}

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

/**
 * Parse sort parameter into field and direction
 * @param {string} sortParam - Sort parameter (e.g., 'name', '-createdAt', '+priority')
 * @returns {Object} {field: string, direction: 'asc' | 'desc'}
 */
export function parseSort(sortParam) {
  if (!sortParam || typeof sortParam !== 'string') {
    return { field: null, direction: 'asc' };
  }

  let field = sortParam;
  let direction = 'asc';

  // Check for leading + or - to indicate direction
  if (sortParam.startsWith('-')) {
    direction = 'desc';
    field = sortParam.slice(1);
  } else if (sortParam.startsWith('+')) {
    direction = 'asc';
    field = sortParam.slice(1);
  }

  return {
    field: field || null,
    direction
  };
}
