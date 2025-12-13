import { validateSchema, getPredefinedSchema, compileSchema } from './schema-compiler.js';

function createValidator(schemaName) {
  return function validate(value) {
    const schema = getPredefinedSchema(schemaName);
    if (!schema) {
      throw new Error(`Unknown schema: ${schemaName}`);
    }
    const result = validateSchema({ value }, schema);
    if (!result.isValid) {
      throw new Error(result.errors.join(', '));
    }
    return value;
  };
}

const cachedValidators = {};

export function validateTaskName(value) {
  if (!cachedValidators.taskName) cachedValidators.taskName = createValidator('taskName');
  return cachedValidators.taskName(value);
}

export function validateFlowName(value) {
  if (!cachedValidators.flowName) cachedValidators.flowName = createValidator('flowName');
  return cachedValidators.flowName(value);
}

export function validateFileName(value) {
  if (!cachedValidators.fileName) cachedValidators.fileName = createValidator('fileName');
  return cachedValidators.fileName(value);
}

export function validateToolId(value) {
  if (!cachedValidators.toolId) cachedValidators.toolId = createValidator('toolId');
  return cachedValidators.toolId(value);
}

export function validateRunId(value) {
  if (!cachedValidators.runId) cachedValidators.runId = createValidator('runId');
  return cachedValidators.runId(value);
}

export function validateEmail(value) {
  if (!cachedValidators.email) cachedValidators.email = createValidator('email');
  return cachedValidators.email(value);
}

export function validateUrl(value) {
  if (!cachedValidators.url) cachedValidators.url = createValidator('url');
  return cachedValidators.url(value);
}

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
