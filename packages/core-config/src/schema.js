import { EnvType, ValidationError } from './schema-types.js';
import { SchemaCoercer } from './schema-coercer.js';
import { envSchema } from './schema-definitions.js';

/**
 * schema.js - Facade for environment variable schema validation
 *
 * Delegates to focused modules:
 * - schema-types: Type definitions and errors
 * - schema-coercer: Type coercion logic
 * - schema-definitions: Environment schema definitions
 */

class EnvSchema {
  constructor() {
    this.rules = new Map();
    this.coercer = new SchemaCoercer();
  }

  define(key, config) {
    this.rules.set(key, config);
    return this;
  }

  validate(env = process.env) {
    const errors = [];
    const result = {};

    for (const [key, config] of this.rules) {
      const value = env[key];
      const { type, required, default: defaultVal, description, values } = config;

      if (value === undefined || value === '') {
        if (required) {
          errors.push(`❌ ${key}: required but not provided${description ? ` (${description})` : ''}`);
        } else {
          result[key] = defaultVal;
        }
        continue;
      }

      try {
        result[key] = this.coercer.coerce(value, type, key, values);
      } catch (e) {
        errors.push(`❌ ${key}: ${e.message}${description ? ` (${description})` : ''}`);
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    return result;
  }
}

export const schema = new EnvSchema();
export { envSchema, EnvSchema, EnvType, ValidationError };
