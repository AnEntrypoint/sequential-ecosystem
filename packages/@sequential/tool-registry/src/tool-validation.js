/**
 * Tool schema and input validation
 */
export function getToolSchema(findToolByName, toolName, version = null) {
  const tool = findToolByName(toolName);
  if (!tool) return null;

  if (!tool.mcp || !tool.mcp.inputSchema) {
    return null;
  }

  const schema = tool.mcp.inputSchema;
  if (!version) return schema;

  return schema.version === version ? schema : null;
}

/**
 * Validate tool input against schema
 */
export function validateToolInput(getToolSchema, toolName, input, version = null) {
  const schema = getToolSchema(toolName, version);
  if (!schema) return { valid: false, error: 'Tool or schema not found' };

  const errors = [];
  const required = schema.required || [];

  for (const field of required) {
    if (!input.hasOwnProperty(field)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Validate type match
 */
export function validateType(value, expectedType) {
  const actualType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
  return actualType === expectedType;
}

/**
 * Validate value constraints
 */
export function validateConstraints(value, constraints) {
  const errors = [];

  if (constraints.enum && !constraints.enum.includes(value)) {
    errors.push(`Value must be one of: ${constraints.enum.join(', ')}`);
  }

  if (constraints.minimum !== undefined && value < constraints.minimum) {
    errors.push(`Value must be >= ${constraints.minimum}`);
  }

  if (constraints.maximum !== undefined && value > constraints.maximum) {
    errors.push(`Value must be <= ${constraints.maximum}`);
  }

  if (constraints.minLength !== undefined && value.length < constraints.minLength) {
    errors.push(`String length must be >= ${constraints.minLength}`);
  }

  if (constraints.maxLength !== undefined && value.length > constraints.maxLength) {
    errors.push(`String length must be <= ${constraints.maxLength}`);
  }

  if (constraints.pattern) {
    const regex = new RegExp(constraints.pattern);
    if (!regex.test(value)) {
      errors.push(`Value must match pattern: ${constraints.pattern}`);
    }
  }

  return errors;
}

/**
 * Validate individual input property
 */
export function validateInputProperty(value, property, fieldName, validateType, validateConstraints) {
  const errors = [];
  const actualType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;

  if (property.type && actualType !== property.type) {
    errors.push(`${fieldName}: Type mismatch - expected ${property.type}, got ${actualType}`);
    return { valid: false, errors };
  }

  if (actualType === 'string') {
    const strErrors = validateConstraints(value, {
      enum: property.enum,
      minLength: property.minLength,
      maxLength: property.maxLength,
      pattern: property.pattern
    });
    errors.push(...strErrors.map(e => `${fieldName}: ${e}`));
  }

  if (actualType === 'number') {
    const numErrors = validateConstraints(value, {
      enum: property.enum,
      minimum: property.minimum,
      maximum: property.maximum
    });
    errors.push(...numErrors.map(e => `${fieldName}: ${e}`));
  }

  if (actualType === 'array' && property.items) {
    if (!value.every(item => validateType(item, property.items.type))) {
      errors.push(`${fieldName}: Array items must be of type ${property.items.type}`);
    }
  }

  if (actualType === 'object' && property.properties) {
    for (const [key, subProp] of Object.entries(property.properties)) {
      if (value.hasOwnProperty(key)) {
        const subErrors = validateInputProperty(value[key], subProp, `${fieldName}.${key}`, validateType, validateConstraints);
        if (!subErrors.valid) {
          errors.push(...subErrors.errors);
        }
      }
    }

    const required = property.required || [];
    for (const requiredKey of required) {
      if (!value.hasOwnProperty(requiredKey)) {
        errors.push(`${fieldName}: Missing required field: ${requiredKey}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Strict tool input validation
 */
export function validateToolInputStrict(findToolByName, toolName, input) {
  const tool = findToolByName(toolName);
  if (!tool) return { valid: false, errors: [`Tool not found: ${toolName}`] };

  const schema = tool.mcp?.inputSchema;
  if (!schema) return { valid: false, errors: [`No schema found for tool: ${toolName}`] };

  const errors = [];
  const required = schema.required || [];

  for (const [fieldName, property] of Object.entries(schema.properties || {})) {
    if (!input.hasOwnProperty(fieldName)) {
      if (required.includes(fieldName)) {
        errors.push(`Missing required field: ${fieldName}`);
      }
      continue;
    }

    const validation = validateInputProperty(input[fieldName], property, fieldName, validateType, validateConstraints);
    if (!validation.valid) {
      errors.push(...validation.errors);
    }
  }

  return { valid: errors.length === 0, errors };
}
