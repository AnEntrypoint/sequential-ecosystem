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

export function createValidator(schemaName) {
  const { getPredefinedSchema, validateSchema: validate } = await import('./schema-compiler.js');
  const schema = getPredefinedSchema(schemaName);
  if (!schema) {
    throw new Error(`Unknown schema: ${schemaName}`);
  }
  return (value) => validate({ value }, schema);
}
