import { ValidationResult } from './validation-result.js';

export function isString(value) {
  if (typeof value !== 'string') {
    return ValidationResult.fail(`must be a string, got ${typeof value}`);
  }
  return ValidationResult.ok(value);
}

export function isNumber(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return ValidationResult.fail(`must be a number, got ${typeof value}`);
  }
  return ValidationResult.ok(value);
}

export function isBoolean(value) {
  if (typeof value !== 'boolean') {
    return ValidationResult.fail(`must be a boolean, got ${typeof value}`);
  }
  return ValidationResult.ok(value);
}

export function isArray(value) {
  if (!Array.isArray(value)) {
    return ValidationResult.fail(`must be an array, got ${typeof value}`);
  }
  return ValidationResult.ok(value);
}

export function isObject(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return ValidationResult.fail(`must be an object, got ${typeof value}`);
  }
  return ValidationResult.ok(value);
}

export function isRequired(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    const name = fieldName ? `'${fieldName}'` : 'Value';
    return ValidationResult.fail(`${name} is required`);
  }
  return ValidationResult.ok(value);
}

export function isOneOf(value, allowed, fieldName) {
  if (!allowed.includes(value)) {
    const name = fieldName ? `'${fieldName}'` : 'Value';
    return ValidationResult.fail(`${name} must be one of: ${allowed.join(', ')}`);
  }
  return ValidationResult.ok(value);
}

export function hasMinLength(value, min, fieldName) {
  if (typeof value === 'string' && value.length < min) {
    const name = fieldName || 'String';
    return ValidationResult.fail(`${name} must be at least ${min} characters`);
  }
  if (Array.isArray(value) && value.length < min) {
    const name = fieldName || 'Array';
    return ValidationResult.fail(`${name} must have at least ${min} items`);
  }
  return ValidationResult.ok(value);
}

export function hasMaxLength(value, max, fieldName) {
  if (typeof value === 'string' && value.length > max) {
    const name = fieldName || 'String';
    return ValidationResult.fail(`${name} must not exceed ${max} characters`);
  }
  if (Array.isArray(value) && value.length > max) {
    const name = fieldName || 'Array';
    return ValidationResult.fail(`${name} must not have more than ${max} items`);
  }
  return ValidationResult.ok(value);
}

export function isInRange(value, min, max, fieldName) {
  if (typeof value !== 'number') {
    return ValidationResult.fail('must be a number');
  }
  if (value < min || value > max) {
    const name = fieldName || 'Value';
    return ValidationResult.fail(`${name} must be between ${min} and ${max}`);
  }
  return ValidationResult.ok(value);
}
