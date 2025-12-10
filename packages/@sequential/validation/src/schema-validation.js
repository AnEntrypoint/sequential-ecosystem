import {
  compileSchema,
  validateSchema,
  PREDEFINED_SCHEMAS,
  getAjvInstance
} from '@sequential/validation';

function createValidator(schemaName) {
  const schema = PREDEFINED_SCHEMAS[schemaName];
  if (!schema) {
    throw new Error(`Unknown schema: ${schemaName}`);
  }

  return function validate(value) {
    const result = validateSchema({ value }, schema);
    if (!result.isValid) {
      throw new Error(result.errors.join(', '));
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
  compileSchema(name, schema);
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
