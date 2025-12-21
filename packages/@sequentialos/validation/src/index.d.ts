/**
 * @module validation
 * TypeScript definitions for comprehensive validation and sanitization utilities
 */

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  errors?: Record<string, string>;
  data?: any;
}

/**
 * Schema definition for input validation
 */
export interface SchemaField {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
  validator?: (value: any) => boolean;
  message?: string;
}

export type Schema = Record<string, SchemaField>;

/**
 * Validate relative path format (no absolute paths, no traversal attempts)
 * @param path - Path to validate
 * @returns Validation result with error message if invalid
 */
export function validatePathRelative(path: string): ValidationResult;

/**
 * Validate task name format (kebab-case, no spaces)
 * @param name - Task name to validate
 * @returns Validation result with error message if invalid
 */
export function validateTaskName(name: string): ValidationResult;

/**
 * Validate file name safety (no path separators, no special chars)
 * @param name - File name to validate
 * @returns Validation result with error message if invalid
 */
export function validateFileName(name: string): ValidationResult;

/**
 * Check if a required field is present and not empty
 * @param value - Value to check
 * @param fieldName - Name of the field for error messages
 * @returns Validation result with error message if invalid
 */
export function validateRequired(value: any, fieldName: string): ValidationResult;

/**
 * Check if a value matches the expected type
 * @param value - Value to check
 * @param expectedType - Expected type (string, number, boolean, object, array, function)
 * @param fieldName - Name of the field for error messages
 * @returns Validation result with error message if invalid
 */
export function validateType(value: any, expectedType: string, fieldName: string): ValidationResult;

/**
 * Validate input against a schema definition
 * @param input - Input object to validate
 * @param schema - Schema definition with field requirements
 * @returns Validation result with errors object containing field-specific errors
 *
 * @example
 * const schema = {
 *   name: { required: true, type: 'string' },
 *   age: { required: false, type: 'number', validator: (v) => v >= 0 }
 * };
 * const result = validateInputSchema({ name: 'John', age: 25 }, schema);
 */
export function validateInputSchema(input: object, schema: Schema): ValidationResult;

/**
 * Clean and validate metadata object
 * @param metadata - Metadata to validate and sanitize
 * @returns Validation result with sanitized data
 */
export function validateAndSanitizeMetadata(metadata: object): ValidationResult;

/**
 * Escape HTML entities to prevent XSS
 * @param text - Text to escape
 * @returns Validation result with escaped data
 */
export function escapeHtml(text: string): ValidationResult;

/**
 * Remove dangerous characters from input
 * @param input - Input to sanitize
 * @returns Validation result with sanitized data
 */
export function sanitizeInput(input: string): ValidationResult;

/**
 * Convenience function to throw validation error
 * @param message - Error message
 * @param field - Field name that failed validation
 * @throws {AppError}
 */
export function throwValidationError(message: string, field?: string | null): never;

/**
 * Validate and throw if invalid
 * @param validationResult - Result from validation function
 * @param field - Field name for error
 * @throws {AppError}
 */
export function validateOrThrow(validationResult: ValidationResult, field?: string | null): void;
