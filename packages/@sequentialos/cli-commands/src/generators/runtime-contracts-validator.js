export function createValidationMethods(schemas) {
  return {
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
    }
  };
}
