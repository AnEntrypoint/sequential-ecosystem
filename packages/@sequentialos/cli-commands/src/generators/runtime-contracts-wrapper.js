export function createInputValidator(inputSchema, contractsValidator) {
  return (taskFn) => {
    return async function wrappedWithValidation(input) {
      const validation = contractsValidator.validateInput('task', taskFn.name, { ...inputSchema, ...input });

      if (!validation.valid) {
        const error = new Error(`Input validation failed: ${validation.errors.join(', ')}`);
        error.code = 'VALIDATION_ERROR';
        error.details = validation.errors;
        throw error;
      }

      return await taskFn(validation.coerced);
    };
  };
}

export function createOutputValidator(outputSchema, contractsValidator) {
  return (taskFn) => {
    return async function wrappedWithValidation(...args) {
      const result = await taskFn(...args);
      const validation = contractsValidator.validateOutput('task', taskFn.name, result);

      if (!validation.valid) {
        const error = new Error(`Output validation failed: ${validation.errors.join(', ')}`);
        error.code = 'VALIDATION_ERROR';
        error.details = validation.errors;
        throw error;
      }

      return result;
    };
  };
}
