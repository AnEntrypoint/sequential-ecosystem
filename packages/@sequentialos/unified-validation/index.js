/**
 * @sequentialos/unified-validation
 * Schema-based validation utilities
 */

/**
 * SchemaValidator class for validating objects against schemas
 */
export class SchemaValidator {
  constructor(schema = {}) {
    this.schema = schema;
  }

  /**
   * Validate an object against the schema
   * @param {Object} obj - Object to validate
   * @returns {Object} Validation result with { valid, errors }
   */
  validate(obj) {
    const errors = [];

    if (!obj || typeof obj !== 'object') {
      return { valid: false, errors: ['Input must be an object'] };
    }

    // Check required fields
    if (this.schema.required && Array.isArray(this.schema.required)) {
      for (const field of this.schema.required) {
        if (!(field in obj)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    // Check properties
    if (this.schema.properties) {
      for (const [key, propSchema] of Object.entries(this.schema.properties)) {
        if (key in obj) {
          const value = obj[key];
          const propErrors = this._validateProperty(key, value, propSchema);
          errors.push(...propErrors);
        }
      }
    }

    // Check for additional properties
    if (this.schema.additionalProperties === false) {
      const allowedKeys = new Set(Object.keys(this.schema.properties || {}));
      for (const key of Object.keys(obj)) {
        if (!allowedKeys.has(key)) {
          errors.push(`Additional property not allowed: ${key}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate a single property
   * @private
   */
  _validateProperty(key, value, schema) {
    const errors = [];

    // Type checking
    if (schema.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== schema.type) {
        errors.push(`Field '${key}' must be of type ${schema.type}, got ${actualType}`);
      }
    }

    // String validations
    if (schema.type === 'string') {
      if (schema.minLength && value.length < schema.minLength) {
        errors.push(`Field '${key}' must have at least ${schema.minLength} characters`);
      }
      if (schema.maxLength && value.length > schema.maxLength) {
        errors.push(`Field '${key}' must have at most ${schema.maxLength} characters`);
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        errors.push(`Field '${key}' does not match required pattern`);
      }
      if (schema.enum && !schema.enum.includes(value)) {
        errors.push(`Field '${key}' must be one of: ${schema.enum.join(', ')}`);
      }
    }

    // Number validations
    if (schema.type === 'number' || schema.type === 'integer') {
      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push(`Field '${key}' must be >= ${schema.minimum}`);
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push(`Field '${key}' must be <= ${schema.maximum}`);
      }
      if (schema.type === 'integer' && !Number.isInteger(value)) {
        errors.push(`Field '${key}' must be an integer`);
      }
    }

    // Array validations
    if (schema.type === 'array') {
      if (schema.minItems && value.length < schema.minItems) {
        errors.push(`Field '${key}' must have at least ${schema.minItems} items`);
      }
      if (schema.maxItems && value.length > schema.maxItems) {
        errors.push(`Field '${key}' must have at most ${schema.maxItems} items`);
      }
      if (schema.items && schema.items.type) {
        value.forEach((item, idx) => {
          const itemType = Array.isArray(item) ? 'array' : typeof item;
          if (itemType !== schema.items.type) {
            errors.push(`Field '${key}[${idx}]' must be of type ${schema.items.type}`);
          }
        });
      }
    }

    return errors;
  }

  /**
   * Set a new schema
   * @param {Object} schema - New schema to use
   */
  setSchema(schema) {
    this.schema = schema;
  }
}

/**
 * Validate an object against a schema
 * @param {Object} obj - Object to validate
 * @param {Object} schema - JSON schema
 * @returns {Object} Validation result
 */
export function validateSchema(obj, schema) {
  const validator = new SchemaValidator(schema);
  return validator.validate(obj);
}

/**
 * Create a validator function for a specific schema
 * @param {Object} schema - JSON schema
 * @returns {Function} Validator function
 */
export function createValidator(schema) {
  const validator = new SchemaValidator(schema);
  return (obj) => validator.validate(obj);
}

export default {
  SchemaValidator,
  validateSchema,
  createValidator
};
