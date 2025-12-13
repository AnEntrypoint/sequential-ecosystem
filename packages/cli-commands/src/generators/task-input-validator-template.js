/**
 * Task Input Validator Template
 * Generates task input validator code templates
 */

export function generateTaskInputValidatorTemplate() {
  return `/**
 * Task Input Validator
 *
 * Automatic validation of task inputs at runtime based on schema.
 */

import { createTaskInputValidator } from '@sequentialos/task-input-validator';

const validator = createTaskInputValidator();

// Register schemas
validator.registerSchema('fetchUser', {
  inputs: [
    { name: 'userId', type: 'number', required: true, minimum: 1 },
    { name: 'includeProfile', type: 'boolean', required: false }
  ]
});

validator.registerSchema('createUser', {
  inputs: [
    { name: 'email', type: 'string', required: true, minLength: 5 },
    { name: 'name', type: 'string', required: true },
    { name: 'role', type: 'string', enum: ['admin', 'user', 'guest'], required: false }
  ]
});

// Define tasks
export async function fetchUser(input) {
  return { userId: input.userId, name: 'User Data' };
}

export async function createUser(input) {
  return { id: Date.now(), email: input.email, name: input.name };
}

// Wrap with validation
export const validatedFetchUser = validator.wrapTask(fetchUser, 'fetchUser',
  validator.getSchema('fetchUser'));

export const validatedCreateUser = validator.wrapTask(createUser, 'createUser',
  validator.getSchema('createUser'));

// Usage with error handling
try {
  const user = await validatedFetchUser({ userId: 123 });
  console.log('User:', user);
} catch (error) {
  if (error.validationErrors) {
    console.error('Validation errors:', error.validationErrors);
  } else {
    console.error('Task error:', error.message);
  }
}
`;
}
