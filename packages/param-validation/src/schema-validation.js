import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ coerceTypes: true });
addFormats(ajv);

const schemas = {
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

const validators = {};
for (const [name, schema] of Object.entries(schemas)) {
  validators[name] = ajv.compile(schema);
}

function createValidator(schemaName) {
  return function validate(value) {
    const validator = validators[schemaName];
    if (!validator) {
      throw new Error(`Unknown schema: ${schemaName}`);
    }

    const result = validator({ value });
    if (!result) {
      const errors = validator.errors || [];
      const messages = errors.map(e => {
        if (e.keyword === 'pattern') {
          return `contains invalid characters`;
        }
        if (e.keyword === 'maxLength') {
          return `exceeds maximum length of ${e.params.limit}`;
        }
        if (e.keyword === 'minLength') {
          return `must be at least ${e.params.limit} characters`;
        }
        if (e.keyword === 'type') {
          return `must be a string`;
        }
        if (e.keyword === 'format') {
          return `invalid ${e.params.format} format`;
        }
        return e.message;
      });
      throw new Error(messages.join(', ') || 'validation failed');
    }

    return value;
  };
}

export const validateTaskName = createValidator('taskName');
export const validateFlowName = createValidator('flowName');
export const validateFileName = createValidator('fileName');
export const validateToolId = createValidator('toolId');
export const validateRunId = createValidator('runId');
export const validateEmail = createValidator('email');
export const validateUrl = createValidator('url');

export function registerCustomSchema(name, schema) {
  schemas[name] = schema;
  validators[name] = ajv.compile(schema);
}

export function getValidator(schemaName) {
  return createValidator(schemaName);
}

export function validateInputSchema(input, schema) {
  if (!schema || !Array.isArray(schema)) {
    return null;
  }

  const errors = [];

  for (const field of schema) {
    const { name, type, required = false } = field;
    const value = input[name];

    if (value === undefined || value === null) {
      if (required) {
        errors.push(`Field '${name}' is required`);
      }
      continue;
    }

    const actualType = typeof value;
    if (type === 'array' && !Array.isArray(value)) {
      errors.push(`Field '${name}' must be an array, got ${actualType}`);
    } else if (type === 'object' && (actualType !== 'object' || Array.isArray(value))) {
      errors.push(`Field '${name}' must be an object, got ${actualType}`);
    } else if (type === 'number' && actualType !== 'number') {
      errors.push(`Field '${name}' must be a number, got ${actualType}`);
    } else if (type === 'string' && actualType !== 'string') {
      errors.push(`Field '${name}' must be a string, got ${actualType}`);
    } else if (type === 'boolean' && actualType !== 'boolean') {
      errors.push(`Field '${name}' must be a boolean, got ${actualType}`);
    }
  }

  return errors.length > 0 ? errors : null;
}

export function validateAndSanitizeMetadata(metadata, maxSize = 10 * 1024 * 1024) {
  if (!metadata || typeof metadata !== 'object') {
    throw new Error('Metadata must be a valid object');
  }

  try {
    JSON.stringify(metadata);
  } catch (e) {
    throw new Error(`Metadata is not JSON serializable: ${e.message}`);
  }

  const serialized = JSON.stringify(metadata);
  if (serialized.length > maxSize) {
    throw new Error(`Metadata exceeds maximum size (${serialized.length} > ${maxSize} bytes)`);
  }

  return metadata;
}
