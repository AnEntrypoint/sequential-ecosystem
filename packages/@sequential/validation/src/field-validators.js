import { ValidationResult } from './validation-result.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/.+/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const IDENTIFIER_PATTERN = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

export function isEmail(value) {
  if (typeof value !== 'string') {
    return ValidationResult.fail('must be a string');
  }
  if (!EMAIL_PATTERN.test(value)) {
    return ValidationResult.fail('invalid email format');
  }
  return ValidationResult.ok(value);
}

export function isUrl(value) {
  if (typeof value !== 'string') {
    return ValidationResult.fail('must be a string');
  }
  if (!URL_PATTERN.test(value)) {
    return ValidationResult.fail('invalid URL format (must be http:// or https://)');
  }
  return ValidationResult.ok(value);
}

export function isUuid(value) {
  if (typeof value !== 'string') {
    return ValidationResult.fail('must be a string');
  }
  if (!UUID_PATTERN.test(value)) {
    return ValidationResult.fail('invalid UUID format');
  }
  return ValidationResult.ok(value);
}

export function isIdentifier(value) {
  if (typeof value !== 'string') {
    return ValidationResult.fail('must be a string');
  }
  if (!IDENTIFIER_PATTERN.test(value)) {
    return ValidationResult.fail('invalid identifier (must start with letter/_ and contain only alphanumeric/_/$)');
  }
  return ValidationResult.ok(value);
}

export function isSlug(value) {
  if (typeof value !== 'string') {
    return ValidationResult.fail('must be a string');
  }
  if (!SLUG_PATTERN.test(value)) {
    return ValidationResult.fail('invalid slug format (lowercase letters, numbers, and hyphens only)');
  }
  return ValidationResult.ok(value);
}

export function isIsoDateTime(value) {
  if (typeof value !== 'string') {
    return ValidationResult.fail('must be a string');
  }
  if (!ISO_DATETIME_PATTERN.test(value)) {
    return ValidationResult.fail('invalid ISO 8601 datetime format');
  }
  return ValidationResult.ok(value);
}

export function isPort(value) {
  if (typeof value !== 'number') {
    return ValidationResult.fail('must be a number');
  }
  if (value < 0 || value > 65535 || !Number.isInteger(value)) {
    return ValidationResult.fail('must be an integer between 0 and 65535');
  }
  return ValidationResult.ok(value);
}

export function isJsonString(value) {
  if (typeof value !== 'string') {
    return ValidationResult.fail('must be a string');
  }
  try {
    JSON.parse(value);
    return ValidationResult.ok(value);
  } catch {
    return ValidationResult.fail('must be valid JSON');
  }
}
