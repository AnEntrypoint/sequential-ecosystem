/**
 * @sequentialos/input-sanitization
 * Input validation and rate limiting utilities
 */

import { createErrorResponse } from '@sequentialos/error-handling';

const RATE_LIMIT_MAP = new Map();

/**
 * Create a rate limiting middleware
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Express middleware
 */
export function createRateLimitMiddleware(maxRequests = 100, windowMs = 60000) {
  // Cleanup old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of RATE_LIMIT_MAP.entries()) {
      const valid = timestamps.filter(t => now - t < windowMs);
      if (valid.length === 0) {
        RATE_LIMIT_MAP.delete(ip);
      } else {
        RATE_LIMIT_MAP.set(ip, valid);
      }
    }
  }, Math.max(windowMs / 2, 30000));

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const now = Date.now();

    if (!RATE_LIMIT_MAP.has(ip)) {
      RATE_LIMIT_MAP.set(ip, []);
    }

    const timestamps = RATE_LIMIT_MAP.get(ip);
    const recentRequests = timestamps.filter(t => now - t < windowMs);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json(createErrorResponse(
        'RATE_LIMIT_EXCEEDED',
        `Too many requests. Limit: ${maxRequests} per ${windowMs}ms`,
        { retryAfter: windowMs / 1000 }
      ));
    }

    recentRequests.push(now);
    RATE_LIMIT_MAP.set(ip, recentRequests);
    next();
  };
}

/**
 * Validate request body fields
 * @param {Object} body - Request body
 * @param {Array<string>} requiredFields - Required field names
 * @throws {Error} If validation fails
 */
export function validateBodyFields(body, requiredFields) {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be an object');
  }

  const missing = [];
  for (const field of requiredFields) {
    if (!(field in body)) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Require a specific field in the request body
 * @param {Object} body - Request body
 * @param {string} fieldName - Field name to require
 * @returns {*} Field value
 * @throws {Error} If field is missing
 */
export function requireBodyField(body, fieldName) {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be an object');
  }

  if (!(fieldName in body)) {
    throw new Error(`Missing required field: ${fieldName}`);
  }

  return body[fieldName];
}

/**
 * Validate that a body field is an array
 * @param {Object} body - Request body
 * @param {string} fieldName - Field name
 * @returns {Array} Field value
 * @throws {Error} If field is not an array
 */
export function validateBodyArray(body, fieldName) {
  const value = requireBodyField(body, fieldName);

  if (!Array.isArray(value)) {
    throw new Error(`Field '${fieldName}' must be an array`);
  }

  return value;
}

/**
 * Check if a field exists in the request body
 * @param {Object} body - Request body
 * @param {string} fieldName - Field name
 * @returns {boolean} True if field exists
 */
export function validateBodyFieldExists(body, fieldName) {
  if (!body || typeof body !== 'object') {
    return false;
  }
  return fieldName in body;
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate string length
 * @param {string} value - String to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @throws {Error} If validation fails
 */
export function validateStringLength(value, minLength = 0, maxLength = Infinity) {
  if (typeof value !== 'string') {
    throw new Error('Value must be a string');
  }

  if (value.length < minLength) {
    throw new Error(`String must be at least ${minLength} characters`);
  }

  if (value.length > maxLength) {
    throw new Error(`String must be at most ${maxLength} characters`);
  }
}

export default {
  createRateLimitMiddleware,
  validateBodyFields,
  requireBodyField,
  validateBodyArray,
  validateBodyFieldExists,
  sanitizeInput,
  validateStringLength
};
