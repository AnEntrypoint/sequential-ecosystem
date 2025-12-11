/**
 * schema-validators.js - Schema validation
 *
 * Generic validators for common schema validation patterns
 */

export class SchemaValidators {
  static validateRequired(obj, fields) {
    if (!obj || typeof obj !== 'object') {
      return { valid: false, errors: ['Object is required'] };
    }

    const errors = [];
    for (const field of fields) {
      if (!(field in obj) || obj[field] === null || obj[field] === undefined) {
        errors.push(`Field '${field}' is required`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateFilter(filter, allowedFields) {
    const errors = [];

    if (!filter || typeof filter !== 'object') {
      return { valid: true, errors: [] };
    }

    for (const key of Object.keys(filter)) {
      if (allowedFields && !allowedFields.includes(key)) {
        errors.push(`Filter field '${key}' is not allowed`);
      }

      const value = filter[key];
      if (value !== null && value !== undefined && typeof value === 'object') {
        errors.push(`Filter value for '${key}' must be a primitive type, not object`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
