import { getAjvInstance } from './ajv-instance.js';
import { ValidationResult } from './validation-result.js';
import { formatAjvErrors } from './error-formatter.js';

const schemaCache = new Map();

export function compileSchema(name, schema) {
  if (schemaCache.has(name)) {
    return schemaCache.get(name);
  }

  const ajv = getAjvInstance();
  const validator = ajv.compile(schema);

  schemaCache.set(name, { schema, validator });
  return { schema, validator };
}

export function validateSchema(data, schema) {
  const ajv = getAjvInstance();
  const validator = ajv.compile(schema);

  const isValid = validator(data);
  if (isValid) {
    return ValidationResult.ok(data);
  }

  const errors = formatAjvErrors(validator.errors);
  return ValidationResult.fail(errors);
}

export function registerPredefinedSchema(name, schema) {
  compileSchema(name, schema);
}

export function getPredefinedSchema(name) {
  const cached = schemaCache.get(name);
  return cached ? cached.schema : null;
}

export function clearSchemaCache() {
  schemaCache.clear();
}

export function getAllSchemas() {
  return Array.from(schemaCache.keys());
}

export const PREDEFINED_SCHEMAS = {
  taskName: {
    type: 'object',
    properties: {
      value: {
        type: 'string',
        pattern: '^[a-zA-Z0-9._-]+$',
        minLength: 1,
        maxLength: 100
      }
    },
    required: ['value']
  },
  flowName: {
    type: 'object',
    properties: {
      value: {
        type: 'string',
        pattern: '^[a-zA-Z0-9._-]+$',
        minLength: 1,
        maxLength: 100
      }
    },
    required: ['value']
  },
  fileName: {
    type: 'object',
    properties: {
      value: {
        type: 'string',
        minLength: 1,
        maxLength: 255
      }
    },
    required: ['value']
  },
  toolId: {
    type: 'object',
    properties: {
      value: {
        type: 'string',
        pattern: '^[a-zA-Z0-9._-]+$',
        minLength: 1,
        maxLength: 100
      }
    },
    required: ['value']
  },
  runId: {
    type: 'object',
    properties: {
      value: {
        type: 'string',
        pattern: '^\\d+',
        minLength: 1,
        maxLength: 100
      }
    },
    required: ['value']
  },
  email: {
    type: 'object',
    properties: {
      value: {
        type: 'string',
        format: 'email'
      }
    },
    required: ['value']
  },
  url: {
    type: 'object',
    properties: {
      value: {
        type: 'string',
        format: 'uri'
      }
    },
    required: ['value']
  }
};

Object.entries(PREDEFINED_SCHEMAS).forEach(([name, schema]) => {
  registerPredefinedSchema(name, schema);
});
