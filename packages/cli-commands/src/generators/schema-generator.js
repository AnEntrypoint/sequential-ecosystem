/**
 * schema-generator.js - Schema and code generation
 *
 * Generate schemas from functions and generate validator code templates
 */

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

function extractParamNames(fn) {
  const fnStr = fn.toString();
  const paramMatch = fnStr.match(/\(([^)]*)\)/);
  if (!paramMatch) return [];

  return paramMatch[1]
    .split(',')
    .map(p => p.trim())
    .filter(p => p && !p.startsWith('='))
    .map(p => p.split('=')[0].trim());
}

export function generateSchemaValidator(schema) {
  return `/**
 * Input Validation
 *
 * Validates inputs against a schema before task execution.
 */

import { createSchemaValidator } from '@sequentialos/schema-validator';

const validator = createSchemaValidator();

const inputSchema = {
  type: 'object',
  properties: {
    id: { type: 'number', minimum: 1 },
    name: { type: 'string', minLength: 1, maxLength: 100 },
    email: { type: 'string', pattern: '^[^@]+@[^@]+\\.[^@]+$' },
    role: { type: 'string', enum: ['admin', 'user', 'guest'] },
    tags: { type: 'array', items: { type: 'string' } }
  },
  required: ['id', 'name']
};

export async function createUser(input) {
  const validation = validator.validate(input, inputSchema);

  if (!validation.valid) {
    throw new Error('Invalid input: ' + validation.errors.join('; '));
  }

  return await __callHostTool__('task', 'save-user', input);
}

export function validateInput(input) {
  return validator.validate(input, inputSchema);
}
`;
}
