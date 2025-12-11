/**
 * Tool parameter validation
 */
export function validateNumberParameter(value, schema, statusCodes) {
  const num = Number(value);
  if (isNaN(num)) {
    return {
      valid: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Expected number, got '${value}'`,
        statusCode: statusCodes.VALIDATION_ERROR,
        constraint: 'type',
        expected: 'number',
        received: typeof value
      }
    };
  }

  if (schema.minimum !== undefined && num < schema.minimum) {
    return {
      valid: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Value ${num} is less than minimum ${schema.minimum}`,
        statusCode: statusCodes.VALIDATION_ERROR,
        constraint: 'minimum',
        value: schema.minimum,
        received: num
      }
    };
  }

  if (schema.maximum !== undefined && num > schema.maximum) {
    return {
      valid: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Value ${num} exceeds maximum ${schema.maximum}`,
        statusCode: statusCodes.VALIDATION_ERROR,
        constraint: 'maximum',
        value: schema.maximum,
        received: num
      }
    };
  }

  return { valid: true };
}

/**
 * Validate string parameter
 */
export function validateStringParameter(value, schema, statusCodes) {
  if (typeof value !== 'string') {
    return {
      valid: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Expected string, got ${typeof value}`,
        statusCode: statusCodes.VALIDATION_ERROR,
        constraint: 'type',
        expected: 'string',
        received: typeof value
      }
    };
  }

  if (schema.minLength && value.length < schema.minLength) {
    return {
      valid: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `String length ${value.length} is less than minimum ${schema.minLength}`,
        statusCode: statusCodes.VALIDATION_ERROR,
        constraint: 'minLength',
        value: schema.minLength,
        received: value.length
      }
    };
  }

  if (schema.maxLength && value.length > schema.maxLength) {
    return {
      valid: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `String length ${value.length} exceeds maximum ${schema.maxLength}`,
        statusCode: statusCodes.VALIDATION_ERROR,
        constraint: 'maxLength',
        value: schema.maxLength,
        received: value.length
      }
    };
  }

  return { valid: true };
}

/**
 * Validate array parameter
 */
export function validateArrayParameter(value, schema, statusCodes) {
  if (!Array.isArray(value)) {
    return {
      valid: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Expected array, got ${typeof value}`,
        statusCode: statusCodes.VALIDATION_ERROR,
        constraint: 'type',
        expected: 'array',
        received: typeof value
      }
    };
  }

  if (schema.minItems && value.length < schema.minItems) {
    return {
      valid: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Array has ${value.length} items, minimum is ${schema.minItems}`,
        statusCode: statusCodes.VALIDATION_ERROR,
        constraint: 'minItems',
        value: schema.minItems,
        received: value.length
      }
    };
  }

  if (schema.maxItems && value.length > schema.maxItems) {
    return {
      valid: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Array has ${value.length} items, maximum is ${schema.maxItems}`,
        statusCode: statusCodes.VALIDATION_ERROR,
        constraint: 'maxItems',
        value: schema.maxItems,
        received: value.length
      }
    };
  }

  return { valid: true };
}

/**
 * Validate tool parameter
 */
export function validateToolParameter(value, schema, statusCodes) {
  if (!schema) return { valid: true };

  if (schema.type === 'number') {
    return validateNumberParameter(value, schema, statusCodes);
  }

  if (schema.type === 'string') {
    return validateStringParameter(value, schema, statusCodes);
  }

  if (schema.type === 'array') {
    return validateArrayParameter(value, schema, statusCodes);
  }

  return { valid: true };
}
