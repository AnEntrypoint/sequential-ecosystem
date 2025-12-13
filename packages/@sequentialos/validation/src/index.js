export { ValidationChain, validate } from './validation-chain.js';
export { validateParam, validateRequired, validateType } from './middleware.js';
export { validatePath, validatePathRelative } from '@sequentialos/path-validation';
export {
  validateTaskName,
  validateFlowName,
  validateFileName,
  validateToolId,
  validateRunId,
  validateEmail,
  validateUrl,
  registerCustomSchema,
  getValidator,
  validateInputSchema,
  validateAndSanitizeMetadata
} from './schema-validation.js';
export { escapeHtml, sanitizeInput } from './input-sanitization.js';
export { ValidationResult } from './validation-result.js';
export {
  getAjvInstance,
  registerCustomKeyword,
  resetAjv
} from './ajv-instance.js';
export {
  compileSchema,
  validateSchema,
  registerPredefinedSchema,
  getPredefinedSchema,
  clearSchemaCache,
  getAllSchemas,
  PREDEFINED_SCHEMAS
} from './schema-compiler.js';
export {
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  isRequired,
  isOneOf,
  hasMinLength,
  hasMaxLength,
  isInRange
} from './type-validators.js';
export {
  isEmail,
  isUrl,
  isUuid,
  isIdentifier,
  isSlug,
  isIsoDateTime,
  isPort,
  isJsonString
} from './field-validators.js';
export {
  formatAjvErrors,
  formatFieldValidationError,
  formatValidationErrors
} from './error-formatter.js';

export async function createValidator(schemaName) {
  const { getPredefinedSchema, validateSchema: validate } = await import('./schema-compiler.js');
  const schema = getPredefinedSchema(schemaName);
  if (!schema) {
    throw new Error(`Unknown schema: ${schemaName}`);
  }
  return (value) => validate({ value }, schema);
}
