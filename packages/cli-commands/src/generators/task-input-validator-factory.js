/**
 * Task Input Validator Factory
 * Creates validators for task input validation with schema registration
 */

export function createTaskInputValidator() {
  const schemas = new Map();

  return {
    registerSchema(taskName, schema) {
      schemas.set(taskName, schema);
      return this;
    },

    getSchema(taskName) {
      return schemas.get(taskName);
    },

    validateInput(taskName, input) {
      const schema = schemas.get(taskName);
      if (!schema || !schema.inputs) {
        return { valid: true, errors: [] };
      }

      const errors = [];
      const fields = schema.inputs || [];

      for (const field of fields) {
        const value = input[field.name];

        if (field.required && (value === undefined || value === null)) {
          errors.push({
            field: field.name,
            message: `Required field missing: ${field.name}`,
            type: 'required'
          });
          continue;
        }

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
          }
        }

        if (field.enum && value !== undefined && !field.enum.includes(value)) {
          errors.push({
            field: field.name,
            message: `Invalid value: ${field.name} must be one of ${field.enum.join(', ')}`,
            type: 'enum_violation',
            validValues: field.enum
          });
        }

        if (field.minLength && typeof value === 'string' && value.length < field.minLength) {
          errors.push({
            field: field.name,
            message: `String too short: ${field.name} must be at least ${field.minLength} characters`,
            type: 'length_violation'
          });
        }

        if (field.minimum && typeof value === 'number' && value < field.minimum) {
          errors.push({
            field: field.name,
            message: `Number too small: ${field.name} must be >= ${field.minimum}`,
            type: 'range_violation'
          });
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };
    },

    wrapTask(taskFn, taskName, schema) {
      this.registerSchema(taskName, schema);

      return async function validatedTask(input) {
        const validation = this.validateInput(taskName, input);
        if (!validation.valid) {
          const errorMsg = validation.errors.map(e => `  - ${e.message}`).join('\n');
          const err = new Error(`Input validation failed for task "${taskName}":\n${errorMsg}`);
          err.validationErrors = validation.errors;
          throw err;
        }

        return await taskFn(input);
      }.bind(this);
    },

    autoValidateAll(tasks) {
      const validated = {};

      for (const [taskName, taskFn] of Object.entries(tasks)) {
        const config = tasks[`${taskName}_config`];
        if (config && config.inputs) {
          validated[taskName] = this.wrapTask(taskFn, taskName, config);
        } else {
          validated[taskName] = taskFn;
        }
      }

      return validated;
    }
  };
}
