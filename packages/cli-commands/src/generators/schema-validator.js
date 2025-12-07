export function createSchemaValidator() {
  return {
    validate(data, schema) {
      const errors = [];

      if (schema.type === 'object' && typeof data !== 'object') {
        errors.push(`Expected object, got ${typeof data}`);
        return { valid: false, errors };
      }

      if (schema.type === 'array' && !Array.isArray(data)) {
        errors.push(`Expected array, got ${typeof data}`);
        return { valid: false, errors };
      }

      if (schema.type === 'string' && typeof data !== 'string') {
        errors.push(`Expected string, got ${typeof data}`);
        return { valid: false, errors };
      }

      if (schema.type === 'number' && typeof data !== 'number') {
        errors.push(`Expected number, got ${typeof data}`);
        return { valid: false, errors };
      }

      if (schema.type === 'boolean' && typeof data !== 'boolean') {
        errors.push(`Expected boolean, got ${typeof data}`);
        return { valid: false, errors };
      }

      if (schema.type === 'object' && schema.properties) {
        const required = schema.required || [];
        for (const prop of required) {
          if (!(prop in data)) {
            errors.push(`Missing required property: ${prop}`);
          }
        }

        for (const [prop, propSchema] of Object.entries(schema.properties || {})) {
          if (prop in data) {
            const result = this.validate(data[prop], propSchema);
            if (!result.valid) {
              errors.push(`Property ${prop}: ${result.errors.join(', ')}`);
            }
          }
        }
      }

      if (schema.type === 'array' && schema.items) {
        for (let i = 0; i < data.length; i++) {
          const result = this.validate(data[i], schema.items);
          if (!result.valid) {
            errors.push(`Item ${i}: ${result.errors.join(', ')}`);
          }
        }
      }

      if (schema.minLength && typeof data === 'string' && data.length < schema.minLength) {
        errors.push(`String must be at least ${schema.minLength} characters`);
      }

      if (schema.maxLength && typeof data === 'string' && data.length > schema.maxLength) {
        errors.push(`String must be at most ${schema.maxLength} characters`);
      }

      if (schema.minimum && typeof data === 'number' && data < schema.minimum) {
        errors.push(`Number must be >= ${schema.minimum}`);
      }

      if (schema.maximum && typeof data === 'number' && data > schema.maximum) {
        errors.push(`Number must be <= ${schema.maximum}`);
      }

      if (schema.enum && !schema.enum.includes(data)) {
        errors.push(`Must be one of: ${schema.enum.join(', ')}`);
      }

      if (schema.pattern && typeof data === 'string') {
        const regex = new RegExp(schema.pattern);
        if (!regex.test(data)) {
          errors.push(`Does not match pattern: ${schema.pattern}`);
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };
    },

    validateRequired(data, requiredFields) {
      const errors = [];
      for (const field of requiredFields) {
        if (!(field in data)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
      return { valid: errors.length === 0, errors };
    },

    validateTypes(data, typeMap) {
      const errors = [];
      for (const [field, expectedType] of Object.entries(typeMap)) {
        if (field in data) {
          const actualType = typeof data[field];
          if (actualType !== expectedType) {
            errors.push(`Field ${field}: expected ${expectedType}, got ${actualType}`);
          }
        }
      }
      return { valid: errors.length === 0, errors };
    }
  };
}

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

import { createSchemaValidator } from '@sequential/schema-validator';

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

export function createBatchValidator(validators) {
  return {
    validateAll(items) {
      const results = [];
      const errors = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const validationResults = [];

        for (const [name, validator] of Object.entries(validators)) {
          const result = validator(item);
          validationResults.push({ validator: name, valid: result.valid });
          if (!result.valid) {
            errors.push({ index: i, validator: name, errors: result.errors });
          }
        }

        results.push({ index: i, validations: validationResults });
      }

      return {
        results,
        errors,
        valid: errors.length === 0,
        errorRate: ((errors.length / items.length) * 100).toFixed(1)
      };
    }
  };
}
