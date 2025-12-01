/**
 * @module validation
 * Parameter and input validation functions for file operations, task names, and schemas
 */

import path from 'path';
import fs from 'fs';
import { createValidationError, createForbiddenError } from '@sequential/error-handling';

/**
 * Validate a file path and ensure it doesn't traverse outside allowed directory
 * @param {string} filePath - The file path to validate
 * @returns {string} The resolved real path
 * @throws {Error} If path is invalid or traversal is detected
 */
export function validateFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    throw createValidationError('Invalid file path', 'filePath');
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
      throw createForbiddenError('Access denied: cannot access file system');
    }
  }

  const relative = path.relative(cwd, realPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw createForbiddenError('Access denied: path traversal detected');
  }

  return realPath;
}

/**
 * Validate task name for valid characters and length
 * @param {string} taskName - The task name to validate
 * @returns {string} The validated task name
 * @throws {Error} If task name is invalid
 */
export function validateTaskName(taskName) {
  if (!taskName || typeof taskName !== 'string') {
    throw createValidationError('Invalid task name', 'taskName');
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(taskName)) {
    throw createValidationError('Task name contains invalid characters (allowed: alphanumeric, dot, dash, underscore)', 'taskName');
  }
  if (taskName.length > 100) {
    throw createValidationError('Task name too long (max 100 characters)', 'taskName');
  }
  return taskName;
}

/**
 * Validate file name for valid characters and length
 * @param {string} fileName - The file name to validate
 * @returns {string} The validated file name
 * @throws {Error} If file name is invalid
 */
export function validateFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    throw createValidationError('Invalid file name', 'fileName');
  }
  if (fileName.includes('/') || fileName.includes('\\') || fileName.startsWith('.')) {
    throw createValidationError('File name contains invalid characters', 'fileName');
  }
  if (fileName.length > 255) {
    throw createValidationError('File name too long (max 255 characters)', 'fileName');
  }
  return fileName;
}

/**
 * Validate a single parameter value
 * @param {any} value - The value to validate
 * @param {string} name - The parameter name for error messages
 * @param {string} [type] - Expected type (optional)
 * @returns {any} The validated value
 * @throws {Error} If validation fails
 */
export function validateParam(value, name, type) {
  if (!value && value !== 0 && value !== false) {
    throw createValidationError(`${name} is required`, name);
  }
  if (type && typeof value !== type) {
    throw createValidationError(`${name} must be a ${type}`, name);
  }
  return value;
}

/**
 * Validate multiple required parameters
 * @param {...{name: string, value: any}} params - Parameter objects with name and value
 * @throws {Error} If any parameter is missing
 */
export function validateRequired(...params) {
  for (const { name, value } of params) {
    if (!value && value !== 0 && value !== false) {
      throw createValidationError(`${name} is required`, name);
    }
  }
}

/**
 * Validate parameter type matches expected type
 * @param {any} value - The value to validate
 * @param {string} name - The parameter name for error messages
 * @param {string} expectedType - Expected type (string, number, boolean, etc.)
 * @returns {any} The validated value
 * @throws {Error} If type doesn't match
 */
export function validateType(value, name, expectedType) {
  const actualType = typeof value;
  if (actualType !== expectedType) {
    throw createValidationError(`${name} must be a ${expectedType}, got ${actualType}`, name);
  }
  return value;
}

/**
 * Validate input object against a schema
 * @param {Object} input - Input object to validate
 * @param {Array<{name: string, type: string, required?: boolean}>} schema - Schema definition array
 * @returns {string[]|null} Array of error messages or null if valid
 */
export function validateInputSchema(input, schema) {
  if (!schema || !Array.isArray(schema)) {
    return null;
  }

  const errors = [];

  for (const field of schema) {
    const { name, type, required = false } = field;
    const value = input[name];

    if (value === undefined || value === null) {
      if (required) {
        errors.push(`Field '${name}' is required`);
      }
      continue;
    }

    const actualType = typeof value;
    if (type === 'array' && !Array.isArray(value)) {
      errors.push(`Field '${name}' must be an array, got ${actualType}`);
    } else if (type === 'object' && (actualType !== 'object' || Array.isArray(value))) {
      errors.push(`Field '${name}' must be an object, got ${actualType}`);
    } else if (type === 'number' && actualType !== 'number') {
      errors.push(`Field '${name}' must be a number, got ${actualType}`);
    } else if (type === 'string' && actualType !== 'string') {
      errors.push(`Field '${name}' must be a string, got ${actualType}`);
    } else if (type === 'boolean' && actualType !== 'boolean') {
      errors.push(`Field '${name}' must be a boolean, got ${actualType}`);
    }
  }

  return errors.length > 0 ? errors : null;
}

/**
 * Validate and sanitize metadata object
 * Ensures metadata is JSON-serializable and doesn't exceed size limit
 * @param {Object} metadata - Metadata object to validate
 * @param {number} [maxSize=10485760] - Maximum size in bytes (default 10MB)
 * @returns {Object} Validated metadata
 * @throws {Error} If metadata is invalid or exceeds max size
 */
export function validateAndSanitizeMetadata(metadata, maxSize = 10 * 1024 * 1024) {
  if (!metadata || typeof metadata !== 'object') {
    throw createValidationError('Metadata must be a valid object', 'metadata');
  }

  try {
    JSON.stringify(metadata);
  } catch (e) {
    throw createValidationError(`Metadata is not JSON serializable: ${e.message}`, 'metadata');
  }

  const serialized = JSON.stringify(metadata);
  if (serialized.length > maxSize) {
    throw createValidationError(`Metadata exceeds maximum size (${serialized.length} > ${maxSize} bytes)`, 'metadata');
  }

  return metadata;
}

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHtml(text) {
  if (!text || typeof text !== 'string') return text;
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };
  return text.replace(/[&<>"'\/]/g, char => map[char]);
}

/**
 * Sanitize user input by trimming and optionally escaping HTML
 * Recursively sanitizes objects
 * @param {any} input - Input to sanitize
 * @param {boolean} [allowHtml=false] - Whether to allow HTML (skip escaping)
 * @returns {any} Sanitized input
 */
export function sanitizeInput(input, allowHtml = false) {
  if (typeof input === 'string') {
    return allowHtml ? input.trim() : escapeHtml(input.trim());
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value, allowHtml);
    }
    return sanitized;
  }
  return input;
}
