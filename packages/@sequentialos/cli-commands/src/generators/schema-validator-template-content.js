/**
 * Schema Validator Template Content
 * Template string for schema validation code generation
 */

export const VALIDATOR_TEMPLATE = `/**
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
    email: { type: 'string', pattern: '^[^@]+@[^@]+\\\\.[^@]+$' },
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
