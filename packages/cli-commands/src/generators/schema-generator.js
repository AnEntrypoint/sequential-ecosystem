/**
 * Schema Generator
 * Generate schemas from functions and validator code templates
 *
 * Delegates to:
 * - function-parameter-extractor: Extract function parameters
 * - schema-validator-template-content: Template string for validators
 */

import { extractParamNames } from './function-parameter-extractor.js';
import { VALIDATOR_TEMPLATE } from './schema-validator-template-content.js';

export function generateSchemaFromFunction(fn) {
  const paramNames = extractParamNames(fn);
  const properties = {};
  const required = paramNames;

  for (const param of paramNames) {
    properties[param] = { type: 'string' };
  }

  return {
    type: 'object',
    properties,
    required,
    description: `Auto-generated schema for ${fn.name || 'anonymous'} function`
  };
}

export function generateSchemaValidator(schema) {
  return VALIDATOR_TEMPLATE;
}
