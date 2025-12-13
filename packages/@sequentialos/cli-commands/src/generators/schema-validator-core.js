/**
 * schema-validator-core.js - Schema Validator Facade
 *
 * Delegates to focused modules:
 * - schema-type-validators: Type checking and constraint validation
 * - schema-generator: Schema generation from functions and code templates
 */

export { createSchemaValidator } from './schema-type-validators.js';
export { generateSchemaFromFunction, generateSchemaValidator } from './schema-generator.js';
