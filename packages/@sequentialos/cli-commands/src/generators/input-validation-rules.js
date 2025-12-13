/**
 * Input Validation Rules
 * Field-level validation rule implementations
 */

export function createValidationRules() {
  return {
    validateRequired(field, value, errors) {
      if (field.required && (value === undefined || value === null)) {
        errors.push({
          field: field.name,
          message: `Required field missing: ${field.name}`,
          type: 'required'
        });
        return false;
      }
      return true;
    },

    validateType(field, value, errors) {
      if (value !== undefined && value !== null && field.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== field.type && !(field.type === 'object' && actualType === 'object')) {
          errors.push({
            field: field.name,
            message: `Type mismatch: ${field.name} is ${actualType}, expected ${field.type}`,
            type: 'type_mismatch',
            expected: field.type,
            actual: actualType
          });
          return false;
        }
      }
      return true;
    },

    validateEnum(field, value, errors) {
      if (field.enum && value !== undefined && !field.enum.includes(value)) {
        errors.push({
          field: field.name,
          message: `Invalid value: ${field.name} must be one of ${field.enum.join(', ')}`,
          type: 'enum_violation',
          validValues: field.enum
        });
        return false;
      }
      return true;
    },

    validateLength(field, value, errors) {
      if (field.minLength && typeof value === 'string' && value.length < field.minLength) {
        errors.push({
          field: field.name,
          message: `String too short: ${field.name} must be at least ${field.minLength} characters`,
          type: 'length_violation'
        });
        return false;
      }
      return true;
    },

    validateRange(field, value, errors) {
      if (field.minimum && typeof value === 'number' && value < field.minimum) {
        errors.push({
          field: field.name,
          message: `Number too small: ${field.name} must be >= ${field.minimum}`,
          type: 'range_violation'
        });
        return false;
      }
      return true;
    }
  };
}
