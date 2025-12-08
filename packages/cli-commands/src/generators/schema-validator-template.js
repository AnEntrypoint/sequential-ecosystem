export function createBatchValidator(validators) {
  return {
    validateAll(items) {
      const results = [];
      const errors = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const validationResults = [];

        for (const [name, validator] of Object.entries(validators)) {
          const result = validator(item);
          validationResults.push({ validator: name, valid: result.valid });
          if (!result.valid) {
            errors.push({ index: i, validator: name, errors: result.errors });
          }
        }

        results.push({ index: i, validations: validationResults });
      }

      return {
        results,
        errors,
        valid: errors.length === 0,
        errorRate: ((errors.length / items.length) * 100).toFixed(1)
      };
    }
  };
}
