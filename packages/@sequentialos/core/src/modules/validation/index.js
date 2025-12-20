/**
 * @module validation
 * Parameter and input validation functions for file operations, task names, and schemas
 */

import { validatePathRelative, validateTaskName as validateTaskNameSchema, validateFileName as validateFileNameSchema, validateRequired as validateRequiredFn, validateType as validateTypeFn, validateInputSchema as validateInputSchemaFn, validateAndSanitizeMetadata as validateAndSanitizeMetadataFn, escapeHtml as escapeHtmlFn, sanitizeInput as sanitizeInputFn } from '@sequentialos/validation';
import { createValidationError, createForbiddenError } from '@sequentialos/error-handling';

/**
 * Validate a file path and ensure it doesn't traverse outside allowed directory
 * @param {string} filePath - The file path to validate
 * @returns {string} The resolved real path
 * @throws {Error} If path is invalid or traversal is detected
 */
export function validateFilePath(filePath) {
  try {
    return validatePathRelative(filePath);
  } catch (err) {
    if (err.code === 'VALIDATION_ERROR') {
      throw createValidationError(err.message, 'filePath');
    }
    throw createForbiddenError(err.message);
  }
}

/**
 * Validate task name for valid characters and length
 * @param {string} taskName - The task name to validate
 * @returns {string} The validated task name
 * @throws {Error} If task name is invalid
 */
export function validateTaskName(taskName) {
  try {
    validateTaskNameSchema(taskName);
    return taskName;
  } catch (err) {
    throw createValidationError(`Task name ${err.message}`, 'taskName');
  }
}

/**
 * Validate file name for valid characters and length
 * @param {string} fileName - The file name to validate
 * @returns {string} The validated file name
 * @throws {Error} If file name is invalid
 */
export function validateFileName(fileName) {
  try {
    validateFileNameSchema(fileName);
    return fileName;
  } catch (err) {
    throw createValidationError(`File name ${err.message}`, 'fileName');
  }
}

export function validateRequired(...params) {
  for (const { name, value } of params) {
    validateRequiredFn(name, value);
  }
}

export function validateType(value, name, expectedType) {
  return validateTypeFn(name, value, expectedType);
}

export const validateInputSchema = validateInputSchemaFn;

export function validateAndSanitizeMetadata(metadata, maxSize = 10 * 1024 * 1024) {
  try {
    const result = validateAndSanitizeMetadataFn(metadata, maxSize);
    return result;
  } catch (err) {
    throw createValidationError(err.message, 'metadata');
  }
}

export function escapeHtml(text) {
  return escapeHtmlFn(text);
}

export function sanitizeInput(input, allowHtml = false) {
  return sanitizeInputFn(input, allowHtml);
}
