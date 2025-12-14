/**
 * Parameter validation utilities for sequential-ecosystem
 * Provides field validators, validation results, and regex patterns
 */

// Export validation result monad
export { ValidationResult } from './result.js';

// Export all field validators
export {
  isUUID,
  isEmail,
  isRequired,
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  isURL,
  isIdentifier,
  isOneOf,
  isPort
} from './field-validators.js';

// Export validation patterns
export { PATTERNS } from './patterns.js';

// Composite validation function
export function validate(data, schema) {
  if (!schema || typeof schema !== 'object') {
    return { valid: true, errors: {} };
  }

  const errors = {};
  for (const [field, rules] of Object.entries(schema)) {
    if (rules.required && (data[field] === undefined || data[field] === null)) {
      errors[field] = `${field} is required`;
    }
    if (data[field] !== undefined && data[field] !== null && rules.type) {
      if (typeof data[field] !== rules.type) {
        errors[field] = `${field} must be of type ${rules.type}`;
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// Path validation to prevent traversal attacks
export function validatePath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('Path must be a non-empty string');
  }

  if (inputPath.includes('..') || inputPath.includes('~') || inputPath.startsWith('/')) {
    throw new Error('Invalid path: contains traversal patterns or absolute path');
  }

  const forbiddenPatterns = [
    /\.\.\//g,
    /\.\.%2f/gi,
    /~\//g,
    /^~$/,
    /^\//, // absolute paths
    /^\w+:/, // Windows drives
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(inputPath)) {
      throw new Error(`Path validation failed: ${inputPath}`);
    }
  }

  return inputPath;
}

// Sanitize user input to prevent XSS
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validate a single parameter
export function validateParam(value, type, required = false) {
  if (required && (value === undefined || value === null || value === '')) {
    throw new Error(`Parameter is required`);
  }

  if (value !== undefined && value !== null && value !== '') {
    if (type === 'string' && typeof value !== 'string') {
      throw new Error(`Parameter must be a string`);
    }
    if (type === 'number' && typeof value !== 'number') {
      throw new Error(`Parameter must be a number`);
    }
    if (type === 'boolean' && typeof value !== 'boolean') {
      throw new Error(`Parameter must be a boolean`);
    }
  }

  return value;
}

// Default export with all utilities
import { ValidationResult } from './result.js';
import * as fieldValidators from './field-validators.js';
import { PATTERNS } from './patterns.js';

export default {
  ValidationResult,
  ...fieldValidators,
  PATTERNS,
  validate,
  validatePath,
  sanitizeInput,
  validateParam
};
