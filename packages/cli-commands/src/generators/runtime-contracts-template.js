export function generateRuntimeContractsTemplate() {
  return `/**
 * Runtime Contracts
 *
 * Auto-generated schemas with type validation and coercion.
 */

import { createRuntimeContracts, createInputValidator } from '@sequential/runtime-contracts';

const contracts = createRuntimeContracts();

// Register schema for task
contracts.registerSchema('task', 'processUser', {
  input: {
    userId: { type: 'number', required: true, minimum: 1 },
    email: { type: 'string', required: true },
    age: { type: 'number', minimum: 18, maximum: 120 },
    role: { type: 'string', enum: ['admin', 'user', 'guest'] }
  },
  output: {
    type: 'object',
    properties: {
      id: { type: 'number', required: true },
      name: { type: 'string', required: true },
      email: { type: 'string', required: true }
    }
  }
});

// Task with input validation
export const processUserTask = createInputValidator({
  userId: { type: 'number', required: true },
  email: { type: 'string', required: true }
})(
  async (input) => {
    return await __callHostTool__('database', 'createUser', input);
  }
);

// Validate before execution
export async function validateUserInput(input) {
  const result = contracts.validateInput('task', 'processUser', input);

  if (!result.valid) {
    console.error('Validation errors:', result.errors);
    return null;
  }

  console.log('Input valid! Coerced:', result.coerced);
  return result.coerced;
}

// Validate output shape
export async function validateUserOutput(output) {
  const result = contracts.validateOutput('task', 'processUser', output);

  if (!result.valid) {
    console.error('Output errors:', result.errors);
    return null;
  }

  return output;
}

// Type coercion examples
export function demonstrateCoercion() {
  const result1 = contracts.tryCoerce('42', 'number');
  console.log('String to number:', result1); // { success: true, value: 42 }

  const result2 = contracts.tryCoerce('true', 'boolean');
  console.log('String to boolean:', result2); // { success: true, value: true }

  const result3 = contracts.tryCoerce(100, 'string');
  console.log('Number to string:', result3); // { success: true, value: '100' }

  return { result1, result2, result3 };
}

// Generate schema from JSDoc
/**
 * @param {number} userId - User ID
 * @param {string} email - User email address
 * @returns {Promise<{id: number, name: string}>}
 */
export async function getUserTask(userId, email) {
  return await __callHostTool__('database', 'getUser', { userId, email });
}

export function getTaskSchema() {
  const schema = contracts.generateSchemaFromJSDoc(getUserTask);
  console.log('Generated schema:', schema);
  return schema;
}

// Flow with input/output contracts
export const flowWithContracts = {
  initial: 'validateInput',
  states: {
    validateInput: {
      input: { userId: 'number', email: 'string' },
      output: { validated: 'boolean', input: 'object' },
      onDone: 'processUser'
    },
    processUser: {
      input: { userId: 'number', email: 'string' },
      output: { user: 'object', success: 'boolean' },
      onDone: 'final'
    },
    final: { type: 'final' }
  }
};
`;
}
