/**
 * Task Input Validator Factory
 * Orchestrates input validation with schema registration and validation rules
 *
 * Delegates to:
 * - input-validator-registry: Schema registration and retrieval
 * - input-validation-rules: Field-level validation rules
 */

import { createValidatorRegistry } from './input-validator-registry.js';
import { createValidationRules } from './input-validation-rules.js';

export function createTaskInputValidator() {
  const registry = createValidatorRegistry();
  const rules = createValidationRules();

  return {
    registerSchema(taskName, schema) {
      registry.register(taskName, schema);
      return this;
    },

    getSchema(taskName) {
      return registry.get(taskName);
    },

    validateInput(taskName, input) {
      const fields = registry.getFields(taskName);
      if (fields.length === 0) {
        return { valid: true, errors: [] };
      }

      const errors = [];
      for (const field of fields) {
        const value = input[field.name];

        if (!rules.validateRequired(field, value, errors)) continue;
        rules.validateType(field, value, errors);
        rules.validateEnum(field, value, errors);
        rules.validateLength(field, value, errors);
        rules.validateRange(field, value, errors);
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
