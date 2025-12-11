/**
 * config-validator.js
 *
 * Configuration validation against schemas
 */

export function createConfigValidator() {
  const schemas = new Map();

  return {
    registerSchema(resourceType, schema) {
      schemas.set(resourceType, schema);
      return this;
    },

    validateConfig(resourceType, config) {
      const schema = schemas.get(resourceType);
      if (!schema) return { valid: true, errors: [] };

      const errors = [];

      if (schema.required) {
        for (const field of schema.required) {
          if (config[field] === undefined) {
            errors.push(`Missing required config: ${field}`);
          }
        }
      }

      for (const [field, constraint] of Object.entries(schema.properties || {})) {
        if (config[field] === undefined) continue;

        if (constraint.type === 'string' && typeof config[field] !== 'string') {
          errors.push(`${field} must be a string`);
        }

        if (constraint.type === 'number' && typeof config[field] !== 'number') {
          errors.push(`${field} must be a number`);
        }

        if (constraint.pattern && !new RegExp(constraint.pattern).test(config[field])) {
          errors.push(`${field} does not match pattern: ${constraint.pattern}`);
        }

        if (constraint.enum && !constraint.enum.includes(config[field])) {
          errors.push(`${field} must be one of: ${constraint.enum.join(', ')}`);
        }
      }

      return { valid: errors.length === 0, errors };
    }
  };
}
