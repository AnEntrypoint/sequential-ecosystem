/**
 * validation-decorator.js
 *
 * Input validation decorator and schema validation logic
 */

export function createValidationDecorator() {
  return {
    withInputValidation(schema) {
      return (taskFn) => {
        return async function wrappedWithValidation(input) {
          const errors = validateAgainstSchema(input, schema);
          if (errors.length > 0) {
            const error = new Error(`Input validation failed: ${errors.join(', ')}`);
            error.code = 'VALIDATION_ERROR';
            error.details = errors;
            throw error;
          }

          return await taskFn(input);
        };
      };
    }
  };
}

export function validateAgainstSchema(input, schema) {
  const errors = [];

  if (schema.type === 'object' && input && typeof input === 'object') {
    for (const [key, constraint] of Object.entries(schema.properties || {})) {
      const value = input[key];

      if (constraint.required && value === undefined) {
        errors.push(`${key} is required`);
      }

      if (constraint.type && value !== undefined && typeof value !== constraint.type) {
        errors.push(`${key} must be ${constraint.type}`);
      }

      if (constraint.minLength && value?.length < constraint.minLength) {
        errors.push(`${key} must be at least ${constraint.minLength} characters`);
      }

      if (constraint.minimum !== undefined && value < constraint.minimum) {
        errors.push(`${key} must be >= ${constraint.minimum}`);
      }

      if (constraint.enum && !constraint.enum.includes(value)) {
        errors.push(`${key} must be one of: ${constraint.enum.join(', ')}`);
      }
    }
  }

  return errors;
}
