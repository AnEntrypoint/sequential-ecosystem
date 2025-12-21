/**
 * @module validation
 * Comprehensive validation and sanitization utilities for Sequential OS
 */

import { createValidationError } from '@sequentialos/error-handling';

/**
 * Higher-order function to create validators with consistent structure
 * @param {string} name - Name of the field being validated
 * @param {function} checkFn - Validation function that returns error message or null if valid
 * @param {string} defaultErrorMsg - Default error message if checkFn doesn't provide one
 * @returns {function} Validator function
 */
export const createValidator = (name, checkFn, defaultErrorMsg = null) => {
  return (value, ...args) => {
    // Null/undefined check
    if (value === null || value === undefined) {
      return { valid: false, error: `${name} is required` };
    }

    // Type check for string validators
    if (typeof value !== 'string' && checkFn.toString().includes('string')) {
      return { valid: false, error: `${name} must be a string` };
    }

    // Empty string check
    if (typeof value === 'string' && value.trim() === '') {
      return { valid: false, error: `${name} cannot be empty` };
    }

    // Run custom validation logic
    const error = checkFn(value, ...args);
    if (error) {
      return { valid: false, error };
    }

    return { valid: true };
  };
};

/**
 * Validate relative path format (no absolute paths, no traversal attempts)
 * @param {string} path - Path to validate
 * @returns {{valid: boolean, error?: string}}
 */
export const validatePathRelative = createValidator(
  'Path',
  (path) => {
    // Check for absolute paths
    if (path.startsWith('/') || /^[a-zA-Z]:[/\\]/.test(path)) {
      return 'Path must be relative, not absolute';
    }

    // Check for path traversal attempts
    if (path.includes('..')) {
      return 'Path traversal sequences (..) are not allowed';
    }

    // Check for dangerous patterns
    if (path.includes('\0')) {
      return 'Null bytes are not allowed in paths';
    }

    return null;
  }
);

/**
 * Validate task name format (kebab-case, no spaces)
 * @param {string} name - Task name to validate
 * @returns {{valid: boolean, error?: string}}
 */
export const validateTaskName = createValidator(
  'Task name',
  (name) => {
    // Check for spaces
    if (name.includes(' ')) {
      return 'Task name must not contain spaces (use kebab-case)';
    }

    // Validate kebab-case format: lowercase letters, numbers, hyphens only
    const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!kebabCaseRegex.test(name)) {
      return 'Task name must be kebab-case (lowercase letters, numbers, and hyphens only)';
    }

    // Ensure it doesn't start or end with hyphen
    if (name.startsWith('-') || name.endsWith('-')) {
      return 'Task name cannot start or end with a hyphen';
    }

    return null;
  }
);

/**
 * Validate file name safety (no path separators, no special chars)
 * @param {string} name - File name to validate
 * @returns {{valid: boolean, error?: string}}
 */
export const validateFileName = createValidator(
  'File name',
  (name) => {
    // Check for path separators
    if (name.includes('/') || name.includes('\\')) {
      return 'File name cannot contain path separators';
    }

    // Check for dangerous characters
    if (name.includes('\0')) {
      return 'Null bytes are not allowed in file names';
    }

    // Check for reserved names (Windows)
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5',
                            'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4',
                            'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    const nameWithoutExt = name.split('.')[0].toUpperCase();
    if (reservedNames.includes(nameWithoutExt)) {
      return `File name "${name}" is reserved by the system`;
    }

    // Check for dots at start (hidden files are ok, but just dot or double dot are not)
    if (name === '.' || name === '..') {
      return 'File name cannot be "." or ".."';
    }

    // Check for control characters
    if (/[\x00-\x1f\x7f]/.test(name)) {
      return 'File name contains invalid control characters';
    }

    // Check for dangerous characters (< > : " | ? *)
    if (/[<>:"|?*]/.test(name)) {
      return 'File name contains invalid characters: < > : " | ? *';
    }

    return null;
  }
);

/**
 * Check if a required field is present and not empty
 * @param {any} value - Value to check
 * @param {string} fieldName - Name of the field for error messages
 * @returns {{valid: boolean, error?: string}}
 */
export function validateRequired(value, fieldName) {
  // Null/undefined check
  if (value === null || value === undefined) {
    return { valid: false, error: `${fieldName} is required` };
  }

  // For strings, check if empty after trimming
  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }

  // For arrays, check if empty
  if (Array.isArray(value) && value.length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }

  // For objects, check if empty (excluding null which is already handled)
  if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }

  return { valid: true };
}

/**
 * Check if a value matches the expected type
 * @param {any} value - Value to check
 * @param {string} expectedType - Expected type (string, number, boolean, object, array, function)
 * @param {string} fieldName - Name of the field for error messages
 * @returns {{valid: boolean, error?: string}}
 */
export function validateType(value, expectedType, fieldName) {
  // Null/undefined check
  if (value === null || value === undefined) {
    return { valid: false, error: `${fieldName} must be of type ${expectedType}` };
  }

  const actualType = Array.isArray(value) ? 'array' : typeof value;

  if (actualType !== expectedType.toLowerCase()) {
    return { valid: false, error: `${fieldName} must be of type ${expectedType}, got ${actualType}` };
  }

  return { valid: true };
}

/**
 * Validate input against a schema definition
 * @param {object} input - Input object to validate
 * @param {object} schema - Schema definition with field requirements
 * @returns {{valid: boolean, error?: string, errors?: object}}
 *
 * Schema format:
 * {
 *   fieldName: { required: true, type: 'string', validator: (val) => bool }
 * }
 */
export function validateInputSchema(input, schema) {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Input must be an object' };
  }

  if (!schema || typeof schema !== 'object') {
    return { valid: false, error: 'Schema must be an object' };
  }

  const errors = {};
  let hasErrors = false;

  for (const [fieldName, rules] of Object.entries(schema)) {
    const value = input[fieldName];

    // Check required
    if (rules.required) {
      const reqResult = validateRequired(value, fieldName);
      if (!reqResult.valid) {
        errors[fieldName] = reqResult.error;
        hasErrors = true;
        continue;
      }
    }

    // Skip further validation if field is not required and not provided
    if (!rules.required && (value === null || value === undefined)) {
      continue;
    }

    // Check type
    if (rules.type) {
      const typeResult = validateType(value, rules.type, fieldName);
      if (!typeResult.valid) {
        errors[fieldName] = typeResult.error;
        hasErrors = true;
        continue;
      }
    }

    // Run custom validator
    if (rules.validator && typeof rules.validator === 'function') {
      try {
        const isValid = rules.validator(value);
        if (!isValid) {
          errors[fieldName] = rules.message || `${fieldName} failed validation`;
          hasErrors = true;
        }
      } catch (err) {
        errors[fieldName] = `Validation error: ${err.message}`;
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    return { valid: false, error: 'Validation failed', errors };
  }

  return { valid: true };
}

/**
 * Clean and validate metadata object
 * @param {object} metadata - Metadata to validate and sanitize
 * @returns {{valid: boolean, error?: string, data?: object}}
 */
export function validateAndSanitizeMetadata(metadata) {
  if (metadata === null || metadata === undefined) {
    return buildSanitizerResult(true, {});
  }

  if (typeof metadata !== 'object' || Array.isArray(metadata)) {
    return buildSanitizerResult(false, null, 'Metadata must be an object');
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(metadata)) {
    // Validate key format
    if (typeof key !== 'string' || key.trim() === '') {
      return buildSanitizerResult(false, null, 'Metadata keys must be non-empty strings');
    }

    // Disallow dangerous key names (prototype pollution attacks)
    if (key.startsWith('__') || key.startsWith('$') || key === 'constructor' || key === 'prototype') {
      return buildSanitizerResult(false, null, `Metadata key "${key}" is not allowed`);
    }

    // Only allow primitive values and simple objects
    if (typeof value === 'function') {
      return buildSanitizerResult(false, null, `Metadata value for "${key}" cannot be a function`);
    }

    // Sanitize strings
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      // Allow arrays of primitives
      const hasNonPrimitive = value.some(v =>
        typeof v === 'object' && v !== null || typeof v === 'function'
      );
      if (hasNonPrimitive) {
        return buildSanitizerResult(false, null, `Metadata array for "${key}" can only contain primitive values`);
      }
      sanitized[key] = value;
    } else if (typeof value === 'object') {
      // Allow one level of nested objects with primitive values only
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (typeof nestedValue === 'object' && nestedValue !== null || typeof nestedValue === 'function') {
          return buildSanitizerResult(false, null, `Metadata for "${key}.${nestedKey}" cannot be an object or function`);
        }
      }
      sanitized[key] = value;
    }
  }

  return buildSanitizerResult(true, sanitized);
}

/**
 * Build validation result for sanitizer functions
 * @param {boolean} isValid - Whether the validation passed
 * @param {any} data - Sanitized data
 * @param {string|null} error - Error message if invalid
 * @returns {{valid: boolean, error?: string, data?: any}}
 */
const buildSanitizerResult = (isValid, data = null, error = null) => {
  if (isValid) {
    return { valid: true, data };
  }
  return { valid: false, error };
};

/**
 * Escape HTML entities to prevent XSS
 * @param {string} text - Text to escape
 * @returns {{valid: boolean, error?: string, data?: string}}
 */
export function escapeHtml(text) {
  if (text === null || text === undefined) {
    return buildSanitizerResult(true, '');
  }

  if (typeof text !== 'string') {
    return buildSanitizerResult(false, null, 'Input must be a string');
  }

  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return buildSanitizerResult(true, escaped);
}

/**
 * Remove dangerous characters from input
 * @param {string} input - Input to sanitize
 * @returns {{valid: boolean, error?: string, data?: string}}
 */
export function sanitizeInput(input) {
  if (input === null || input === undefined) {
    return buildSanitizerResult(true, '');
  }

  if (typeof input !== 'string') {
    return buildSanitizerResult(false, null, 'Input must be a string');
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Remove control characters except newline, tab, and carriage return
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return buildSanitizerResult(true, sanitized);
}

/**
 * Convenience function to throw validation error
 * @param {string} message - Error message
 * @param {string} field - Field name that failed validation
 * @throws {AppError}
 */
export function throwValidationError(message, field = null) {
  throw createValidationError(message, field);
}

/**
 * Validate and throw if invalid
 * @param {object} validationResult - Result from validation function
 * @param {string} field - Field name for error
 * @throws {AppError}
 */
export function validateOrThrow(validationResult, field = null) {
  if (!validationResult.valid) {
    throwValidationError(validationResult.error, field);
  }
}
