export function createToolInvocationValidator() {
  const schemaCache = new Map();
  const cacheTimeout = 5 * 60 * 1000;

  return {
    cacheSchema(toolName, schema) {
      schemaCache.set(toolName, {
        schema: schema,
        timestamp: Date.now()
      });
    },

    getCachedSchema(toolName) {
      const cached = schemaCache.get(toolName);
      if (!cached) return null;

      const isExpired = Date.now() - cached.timestamp > cacheTimeout;
      if (isExpired) {
        schemaCache.delete(toolName);
        return null;
      }

      return cached.schema;
    },

    validateParameterSchema(params, schema) {
      const errors = [];
      const warnings = [];

      if (!schema) {
        return { valid: true, errors: [], warnings: [] };
      }

      const expectedKeys = Object.keys(schema.properties || {});
      const actualKeys = Object.keys(params || {});

      for (const key of expectedKeys) {
        const field = schema.properties[key];
        const value = params[key];

        if (field.required && (value === undefined || value === null)) {
          errors.push({
            field: key,
            issue: 'missing required parameter',
            expected: field.type || 'any',
            received: typeof value
          });
        }

        if (value !== undefined && value !== null) {
          if (field.type && typeof value !== field.type) {
            errors.push({
              field: key,
              issue: 'type mismatch',
              expected: field.type,
              received: typeof value
            });
          }

          if (field.enum && !field.enum.includes(value)) {
            errors.push({
              field: key,
              issue: 'invalid enum value',
              expected: field.enum,
              received: value
            });
          }

          if (field.minLength && typeof value === 'string' && value.length < field.minLength) {
            errors.push({
              field: key,
              issue: 'string too short',
              expected: 'minLength: ' + field.minLength,
              received: 'length: ' + value.length
            });
          }

          if (field.maxLength && typeof value === 'string' && value.length > field.maxLength) {
            errors.push({
              field: key,
              issue: 'string too long',
              expected: 'maxLength: ' + field.maxLength,
              received: 'length: ' + value.length
            });
          }

          if (field.min && typeof value === 'number' && value < field.min) {
            errors.push({
              field: key,
              issue: 'value too small',
              expected: 'min: ' + field.min,
              received: value
            });
          }

          if (field.max && typeof value === 'number' && value > field.max) {
            errors.push({
              field: key,
              issue: 'value too large',
              expected: 'max: ' + field.max,
              received: value
            });
          }
        }
      }

      for (const key of actualKeys) {
        if (!expectedKeys.includes(key)) {
          warnings.push({
            field: key,
            issue: 'unexpected parameter',
            note: 'parameter not in schema'
          });
        }
      }

      return {
        valid: errors.length === 0,
        errors: errors,
        warnings: warnings
      };
    },

    formatValidationError(toolName, validation) {
      if (validation.valid) {
        return null;
      }

      const lines = [];
      lines.push('Tool invocation validation failed for: ' + toolName);

      if (validation.errors.length > 0) {
        lines.push('Errors:');
        for (const err of validation.errors) {
          const msg = '  - ' + err.field + ': ' + err.issue;
          lines.push(msg);
          if (err.expected) {
            lines.push('    Expected: ' + JSON.stringify(err.expected));
          }
          if (err.received) {
            lines.push('    Received: ' + JSON.stringify(err.received));
          }
        }
      }

      if (validation.warnings.length > 0) {
        lines.push('Warnings:');
        for (const warn of validation.warnings) {
          lines.push('  - ' + warn.field + ': ' + warn.issue);
        }
      }

      return lines.join('\n');
    },

    validateToolInvocation(toolName, params, schema) {
      if (!schema) {
        return {
          valid: true,
          toolName: toolName,
          message: 'No schema available (will validate at server)'
        };
      }

      const validation = this.validateParameterSchema(params, schema);

      return {
        valid: validation.valid,
        toolName: toolName,
        message: validation.valid ? 'Valid' : this.formatValidationError(toolName, validation),
        errors: validation.errors,
        warnings: validation.warnings
      };
    },

    getParameterSchema(toolName, allSchemas) {
      let schema = this.getCachedSchema(toolName);
      if (schema) {
        return schema;
      }

      if (allSchemas && allSchemas[toolName]) {
        schema = allSchemas[toolName];
        this.cacheSchema(toolName, schema);
        return schema;
      }

      return null;
    },

    suggestFix(error) {
      if (!error || !error.field) {
        return null;
      }

      const suggestions = [];

      if (error.issue === 'missing required parameter') {
        suggestions.push('Add required parameter: ' + error.field);
        suggestions.push('Expected type: ' + error.expected);
      }

      if (error.issue === 'type mismatch') {
        suggestions.push('Change ' + error.field + ' type from ' + error.received + ' to ' + error.expected);
      }

      if (error.issue === 'invalid enum value') {
        const validValues = Array.isArray(error.expected) ? error.expected.join(', ') : error.expected;
        suggestions.push('Change ' + error.field + ' to one of: ' + validValues);
      }

      if (error.issue === 'string too short') {
        suggestions.push('Increase ' + error.field + ' length (minimum: ' + error.expected + ')');
      }

      if (error.issue === 'string too long') {
        suggestions.push('Decrease ' + error.field + ' length (maximum: ' + error.expected + ')');
      }

      if (error.issue === 'value too small') {
        suggestions.push('Increase ' + error.field + ' value (minimum: ' + error.expected + ')');
      }

      if (error.issue === 'value too large') {
        suggestions.push('Decrease ' + error.field + ' value (maximum: ' + error.expected + ')');
      }

      return suggestions.length > 0 ? suggestions : null;
    },

    clearCache() {
      schemaCache.clear();
    }
  };
}
