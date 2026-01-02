import { EnvType } from './schema-types.js';

/**
 * schema-coercer.js
 *
 * Environment variable type coercion and validation
 */

export class SchemaCoercer {
  coerce(value, type, key, allowedValues) {
    switch (type) {
      case EnvType.STRING:
        return String(value);

      case EnvType.NUMBER: {
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`must be a valid number, got "${value}"`);
        }
        return num;
      }

      case EnvType.BOOLEAN:
        return value === 'true' || value === '1' || value === 'yes';

      case EnvType.PORT: {
        const port = Number(value);
        if (isNaN(port) || port < 1 || port > 65535) {
          throw new Error(`must be a valid port number (1-65535), got "${value}"`);
        }
        return port;
      }

      case EnvType.URL: {
        try {
          new URL(value);
          return value;
        } catch {
          throw new Error(`must be a valid URL, got "${value}"`);
        }
      }

      case EnvType.ENUM: {
        if (!allowedValues || !allowedValues.includes(value)) {
          throw new Error(`must be one of ${allowedValues.join(', ')}, got "${value}"`);
        }
        return value;
      }

      default:
        return value;
    }
  }
}
