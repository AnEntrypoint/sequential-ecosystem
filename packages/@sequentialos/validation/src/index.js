/**
 * @module validation
 * Comprehensive validation and sanitization utilities for Sequential OS
 */

import { createValidationError } from '@sequentialos/error-handling';

/**
 * Validate relative path format (no absolute paths, no traversal attempts)
 * @param {string} path - Path to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validatePathRelative(path) {
  if (path === null || path === undefined) {
    return { valid: false, error: 'Path is required' };
  }

  if (typeof path !== 'string') {
    return { valid: false, error: 'Path must be a string' };
  }

  if (path.trim() === '') {
    return { valid: false, error: 'Path cannot be empty' };
  }

  // Check for absolute paths
  if (path.startsWith('/') || /^[a-zA-Z]:[/\\]/.test(path)) {
    return { valid: false, error: 'Path must be relative, not absolute' };
  }

  // Check for path traversal attempts
  if (path.includes('..')) {
    return { valid: false, error: 'Path traversal sequences (..) are not allowed' };
  }

  // Check for dangerous patterns
  if (path.includes('\0')) {
    return { valid: false, error: 'Null bytes are not allowed in paths' };
  }

  return { valid: true };
}

/**
 * Validate task name format (kebab-case, no spaces)
 * @param {string} name - Task name to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validateTaskName(name) {
  if (name === null || name === undefined) {
    return { valid: false, error: 'Task name is required' };
  }

  if (typeof name !== 'string') {
    return { valid: false, error: 'Task name must be a string' };
  }

  if (name.trim() === '') {
    return { valid: false, error: 'Task name cannot be empty' };
  }

  // Check for spaces
  if (name.includes(' ')) {
    return { valid: false, error: 'Task name must not contain spaces (use kebab-case)' };
  }

  // Validate kebab-case format: lowercase letters, numbers, hyphens only
  const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!kebabCaseRegex.test(name)) {
    return { valid: false, error: 'Task name must be kebab-case (lowercase letters, numbers, and hyphens only)' };
  }

  // Ensure it doesn't start or end with hyphen
  if (name.startsWith('-') || name.endsWith('-')) {
    return { valid: false, error: 'Task name cannot start or end with a hyphen' };
  }

  return { valid: true };
}

/**
 * Validate file name safety (no path separators, no special chars)
 * @param {string} name - File name to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validateFileName(name) {
  if (name === null || name === undefined) {
    return { valid: false, error: 'File name is required' };
  }

  if (typeof name !== 'string') {
    return { valid: false, error: 'File name must be a string' };
  }

  if (name.trim() === '') {
    return { valid: false, error: 'File name cannot be empty' };
  }

  // Check for path separators
  if (name.includes('/') || name.includes('\\')) {
    return { valid: false, error: 'File name cannot contain path separators' };
  }

  // Check for dangerous characters
  if (name.includes('\0')) {
    return { valid: false, error: 'Null bytes are not allowed in file names' };
  }

  // Check for reserved names (Windows)
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5',
                          'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4',
                          'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
  const nameWithoutExt = name.split('.')[0].toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    return { valid: false, error: `File name "${name}" is reserved by the system` };
  }

  // Check for dots at start (hidden files are ok, but just dot or double dot are not)
  if (name === '.' || name === '..') {
    return { valid: false, error: 'File name cannot be "." or ".."' };
  }

  // Check for control characters
  if (/[\x00-\x1f\x7f]/.test(name)) {
    return { valid: false, error: 'File name contains invalid control characters' };
  }

  // Check for dangerous characters (< > : " | ? *)
  if (/[<>:"|?*]/.test(name)) {
    return { valid: false, error: 'File name contains invalid characters: < > : " | ? *' };
  }

  return { valid: true };
}

/**
 * Check if a required field is present and not empty
 * @param {any} value - Value to check
 * @param {string} fieldName - Name of the field for error messages
 * @returns {{valid: boolean, error?: string}}
 */
export function validateRequired(value, fieldName) {
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
    return { valid: true, data: {} };
  }

  if (typeof metadata !== 'object' || Array.isArray(metadata)) {
    return { valid: false, error: 'Metadata must be an object' };
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(metadata)) {
    // Validate key format
    if (typeof key !== 'string' || key.trim() === '') {
      return { valid: false, error: 'Metadata keys must be non-empty strings' };
    }

    // Disallow dangerous key names (prototype pollution attacks)
    if (key.startsWith('__') || key.startsWith('$') || key === 'constructor' || key === 'prototype') {
      return { valid: false, error: `Metadata key "${key}" is not allowed` };
    }

    // Only allow primitive values and simple objects
    if (typeof value === 'function') {
      return { valid: false, error: `Metadata value for "${key}" cannot be a function` };
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
        return { valid: false, error: `Metadata array for "${key}" can only contain primitive values` };
      }
      sanitized[key] = value;
    } else if (typeof value === 'object') {
      // Allow one level of nested objects with primitive values only
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (typeof nestedValue === 'object' && nestedValue !== null || typeof nestedValue === 'function') {
          return { valid: false, error: `Metadata for "${key}.${nestedKey}" cannot be an object or function` };
        }
      }
      sanitized[key] = value;
    }
  }

  return { valid: true, data: sanitized };
}

/**
 * Escape HTML entities to prevent XSS
 * @param {string} text - Text to escape
 * @returns {{valid: boolean, error?: string, data?: string}}
 */
export function escapeHtml(text) {
  if (text === null || text === undefined) {
    return { valid: true, data: '' };
  }

  if (typeof text !== 'string') {
    return { valid: false, error: 'Input must be a string' };
  }

  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return { valid: true, data: escaped };
}

/**
 * Remove dangerous characters from input
 * @param {string} input - Input to sanitize
 * @returns {{valid: boolean, error?: string, data?: string}}
 */
export function sanitizeInput(input) {
  if (input === null || input === undefined) {
    return { valid: true, data: '' };
  }

  if (typeof input !== 'string') {
    return { valid: false, error: 'Input must be a string' };
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Remove control characters except newline, tab, and carriage return
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return { valid: true, data: sanitized };
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
