export function createConfigValidator() {
  const schemas = new Map();
  const validators = new Map();

  return {
    registerSchema(name, schema) {
      schemas.set(name, schema);
      if (schema.validate) {
        validators.set(name, schema.validate);
      }
    },

    validateConfig(name, config) {
      const schema = schemas.get(name);
      if (!schema) {
        return { valid: true, errors: [] };
      }

      const errors = [];

      if (schema.required) {
        for (const field of schema.required) {
          if (!(field in config)) {
            errors.push(`Missing required field: ${field}`);
          }
        }
      }

      if (schema.properties) {
        for (const [field, fieldSchema] of Object.entries(schema.properties)) {
          if (field in config) {
            const value = config[field];

            if (fieldSchema.type && typeof value !== fieldSchema.type) {
              errors.push(`Field ${field}: expected ${fieldSchema.type}, got ${typeof value}`);
            }

            if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
              errors.push(`Field ${field}: must be one of ${fieldSchema.enum.join(', ')}`);
            }

            if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
              errors.push(`Field ${field}: minimum length is ${fieldSchema.minLength}`);
            }

            if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
              errors.push(`Field ${field}: maximum length is ${fieldSchema.maxLength}`);
            }

            if (fieldSchema.pattern && !new RegExp(fieldSchema.pattern).test(value)) {
              errors.push(`Field ${field}: invalid format`);
            }
          }
        }
      }

      const validator = validators.get(name);
      if (validator) {
        try {
          validator(config);
        } catch (e) {
          errors.push(e.message);
        }
      }

      return { valid: errors.length === 0, errors };
    },

    getSchema(name) {
      return schemas.get(name);
    },

    getAllSchemas() {
      return Object.fromEntries(schemas);
    },

    validate(name, config) {
      const result = this.validateConfig(name, config);
      if (!result.valid) {
        throw new Error(`Validation failed for ${name}:\n${result.errors.join('\n')}`);
      }
      return config;
    }
  };
}

export function mergeConfigs(...configs) {
  return configs.reduce((acc, cfg) => ({ ...acc, ...cfg }), {});
}

export function getConfigValue(config, path) {
  const parts = path.split('.');
  let current = config;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return current;
}

export function setConfigValue(config, path, value) {
  const parts = path.split('.');
  let current = config;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
  return config;
}

export function pickConfig(config, keys) {
  const result = {};
  for (const key of keys) {
    if (key in config) {
      result[key] = config[key];
    }
  }
  return result;
}

export function omitConfig(config, keys) {
  const result = { ...config };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}
