export function validateParameterSchema(params, schema) {
  const errors = [];
  const warnings = [];

  if (!schema) {
    return { valid: true, errors: [], warnings: [] };
  }

  const expectedKeys = Object.keys(schema.properties || {});
  const actualKeys = Object.keys(params || {});

  for (const key of expectedKeys) {
    const field = schema.properties[key];
    const value = params[key];

    if (field.required && (value === undefined || value === null)) {
      errors.push({
        field: key,
        issue: 'missing required parameter',
        expected: field.type || 'any',
        received: typeof value
      });
    }

    if (value !== undefined && value !== null) {
      if (field.type && typeof value !== field.type) {
        errors.push({
          field: key,
          issue: 'type mismatch',
          expected: field.type,
          received: typeof value
        });
      }

      if (field.enum && !field.enum.includes(value)) {
        errors.push({
          field: key,
          issue: 'invalid enum value',
          expected: field.enum,
          received: value
        });
      }

      if (field.minLength && typeof value === 'string' && value.length < field.minLength) {
        errors.push({
          field: key,
          issue: 'string too short',
          expected: 'minLength: ' + field.minLength,
          received: 'length: ' + value.length
        });
      }

      if (field.maxLength && typeof value === 'string' && value.length > field.maxLength) {
        errors.push({
          field: key,
          issue: 'string too long',
          expected: 'maxLength: ' + field.maxLength,
          received: 'length: ' + value.length
        });
      }

      if (field.min && typeof value === 'number' && value < field.min) {
        errors.push({
          field: key,
          issue: 'value too small',
          expected: 'min: ' + field.min,
          received: value
        });
      }

      if (field.max && typeof value === 'number' && value > field.max) {
        errors.push({
          field: key,
          issue: 'value too large',
          expected: 'max: ' + field.max,
          received: value
        });
      }
    }
  }

  for (const key of actualKeys) {
    if (!expectedKeys.includes(key)) {
      warnings.push({
        field: key,
        issue: 'unexpected parameter',
        note: 'parameter not in schema'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings
  };
}
