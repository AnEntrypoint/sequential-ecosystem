/**
 * validation-rules.js - Individual constraint validation rules
 *
 * Separate validation rules for each constraint type
 */

export class ValidationRules {
  static validateRequired(value, schema) {
    if (schema.required && (value === undefined || value === null)) {
      return {
        valid: false,
        error: { message: 'Required field', reason: 'required' }
      };
    }
    return { valid: true };
  }

  static validateType(value, schema) {
    if (value === undefined || value === null) return { valid: true };
    if (schema.type && typeof value !== schema.type) {
      return {
        valid: false,
        error: { message: 'Type mismatch', reason: 'type' }
      };
    }
    return { valid: true };
  }

  static validateEnum(value, schema) {
    if (value === undefined || value === null) return { valid: true };
    if (schema.enum && !schema.enum.includes(value)) {
      return {
        valid: false,
        error: { message: 'Invalid enum value', reason: 'enum' }
      };
    }
    return { valid: true };
  }

  static validateStringLength(value, schema) {
    if (value === undefined || value === null || typeof value !== 'string') return { valid: true };

    if (schema.minLength && value.length < schema.minLength) {
      return {
        valid: false,
        error: { message: 'String too short', reason: 'minLength' }
      };
    }

    if (schema.maxLength && value.length > schema.maxLength) {
      return {
        valid: false,
        error: { message: 'String too long', reason: 'maxLength' }
      };
    }

    return { valid: true };
  }

  static validateNumberRange(value, schema) {
    if (value === undefined || value === null || typeof value !== 'number') return { valid: true };

    if (schema.min && value < schema.min) {
      return {
        valid: false,
        error: { message: 'Number too small', reason: 'min' }
      };
    }

    if (schema.max && value > schema.max) {
      return {
        valid: false,
        error: { message: 'Number too large', reason: 'max' }
      };
    }

    return { valid: true };
  }

  static validatePattern(value, schema) {
    if (value === undefined || value === null || typeof value !== 'string') return { valid: true };
    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(value)) {
        return {
          valid: false,
          error: { message: 'Pattern mismatch', reason: 'pattern' }
        };
      }
    }
    return { valid: true };
  }

  static runAllValidations(value, schema) {
    const validations = [
      this.validateRequired(value, schema),
      this.validateType(value, schema),
      this.validateEnum(value, schema),
      this.validateStringLength(value, schema),
      this.validateNumberRange(value, schema),
      this.validatePattern(value, schema)
    ];

    const errors = validations.filter(v => !v.valid).map(v => v.error);
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
