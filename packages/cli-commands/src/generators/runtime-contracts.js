export function createRuntimeContracts() {
  const schemas = new Map();
  const coercions = new Map();

  return {
    registerSchema(resourceType, resourceName, schema) {
      const key = `${resourceType}:${resourceName}`;
      schemas.set(key, schema);
      return this;
    },

    validateInput(resourceType, resourceName, input) {
      const key = `${resourceType}:${resourceName}`;
      const schema = schemas.get(key);

      if (!schema || !schema.input) {
        return { valid: true, errors: [] };
      }

      const errors = [];
      const inputSchema = schema.input;

      for (const [paramName, constraint] of Object.entries(inputSchema)) {
        const value = input[paramName];

        if (constraint.required && value === undefined) {
          errors.push(`Missing required parameter: ${paramName}`);
        }

        if (value !== undefined) {
          if (constraint.type && typeof value !== constraint.type) {
            const coerced = this.tryCoerce(value, constraint.type);
            if (coerced.success) {
              input[paramName] = coerced.value;
            } else {
              errors.push(`${paramName} must be ${constraint.type}, got ${typeof value}`);
            }
          }

          if (constraint.minLength && value.length < constraint.minLength) {
            errors.push(`${paramName} must be at least ${constraint.minLength} characters`);
          }

          if (constraint.minimum !== undefined && value < constraint.minimum) {
            errors.push(`${paramName} must be >= ${constraint.minimum}`);
          }

          if (constraint.enum && !constraint.enum.includes(value)) {
            errors.push(`${paramName} must be one of: ${constraint.enum.join(', ')}`);
          }
        }
      }

      return { valid: errors.length === 0, errors, coerced: input };
    },

    validateOutput(resourceType, resourceName, output) {
      const key = `${resourceType}:${resourceName}`;
      const schema = schemas.get(key);

      if (!schema || !schema.output) {
        return { valid: true, errors: [] };
      }

      const errors = [];
      const outputSchema = schema.output;

      if (outputSchema.type === 'object') {
        for (const [fieldName, constraint] of Object.entries(outputSchema.properties || {})) {
          const value = output[fieldName];

          if (constraint.required && value === undefined) {
            errors.push(`Missing required output field: ${fieldName}`);
          }

          if (value !== undefined && constraint.type && typeof value !== constraint.type) {
            errors.push(`${fieldName} must be ${constraint.type}, got ${typeof value}`);
          }
        }
      }

      return { valid: errors.length === 0, errors };
    },

    tryCoerce(value, targetType) {
      if (typeof value === targetType) {
        return { success: true, value };
      }

      if (targetType === 'number') {
        const num = Number(value);
        if (!isNaN(num)) return { success: true, value: num };
      }

      if (targetType === 'string') {
        return { success: true, value: String(value) };
      }

      if (targetType === 'boolean') {
        if (value === 'true' || value === true || value === 1 || value === '1') {
          return { success: true, value: true };
        }
        if (value === 'false' || value === false || value === 0 || value === '0') {
          return { success: true, value: false };
        }
      }

      return { success: false, value };
    },

    createContractValidator(resourceType, resourceName) {
      const self = this;

      return {
        validate(input) {
          const validation = self.validateInput(resourceType, resourceName, input);
          if (!validation.valid) {
            throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
          }
          return validation.coerced;
        },

        validateOutput(output) {
          const validation = self.validateOutput(resourceType, resourceName, output);
          if (!validation.valid) {
            throw new Error(`Invalid output: ${validation.errors.join(', ')}`);
          }
          return output;
        }
      };
    },

    generateSchemaFromJSDoc(fn) {
      const fnStr = fn.toString();
      const jsdocMatch = fnStr.match(/\/\*\*([\s\S]*?)\*\//);

      if (!jsdocMatch) {
        return { input: {}, output: {} };
      }

      const jsdoc = jsdocMatch[1];
      const paramMatches = [...jsdoc.matchAll(/@param\s+\{(\w+)\}\s+(\w+)\s+-\s+(.*)/g)];
      const returnMatch = jsdoc.match(/@returns?\s+\{(\w+)\}\s+-\s+(.*)/);

      const input = {};
      for (const [, type, name, desc] of paramMatches) {
        input[name] = { type: type.toLowerCase(), description: desc };
      }

      const output = returnMatch
        ? { type: returnMatch[1].toLowerCase(), description: returnMatch[2] }
        : {};

      return { input, output };
    },

    generateSchemaFromSignature(fn) {
      const fnStr = fn.toString();
      const paramMatch = fnStr.match(/\(([^)]*)\)/);

      if (!paramMatch) {
        return { input: {}, output: {} };
      }

      const params = paramMatch[1]
        .split(',')
        .map(p => p.trim())
        .filter(p => p)
        .map(p => p.split('=')[0].trim());

      const input = {};
      for (const param of params) {
        input[param] = { type: 'unknown' };
      }

      return { input, output: { type: 'unknown' } };
    },

    createWithContract(resourceType, resourceName, fn) {
      const self = this;
      const validator = this.createContractValidator(resourceType, resourceName);

      return async function contractEnforced(input) {
        const validatedInput = validator.validate(input);
        const result = await fn(validatedInput);
        return validator.validateOutput(result);
      };
    }
  };
}

export function createInputValidator(inputSchema) {
  const contracts = createRuntimeContracts();

  return (taskFn) => {
    return async function wrappedWithValidation(input) {
      const validation = contracts.validateInput('task', taskFn.name, { ...inputSchema, ...input });

      if (!validation.valid) {
        const error = new Error(`Input validation failed: ${validation.errors.join(', ')}`);
        error.code = 'VALIDATION_ERROR';
        error.details = validation.errors;
        throw error;
      }

      return await taskFn(validation.coerced);
    };
  };
}

export function createOutputValidator(outputSchema) {
  const contracts = createRuntimeContracts();

  return (taskFn) => {
    return async function wrappedWithValidation(...args) {
      const result = await taskFn(...args);
      const validation = contracts.validateOutput('task', taskFn.name, result);

      if (!validation.valid) {
        const error = new Error(`Output validation failed: ${validation.errors.join(', ')}`);
        error.code = 'VALIDATION_ERROR';
        error.details = validation.errors;
        throw error;
      }

      return result;
    };
  };
}

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
