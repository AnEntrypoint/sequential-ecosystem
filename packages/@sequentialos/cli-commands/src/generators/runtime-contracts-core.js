import { createValidationMethods } from './runtime-contracts-validator.js';
import { createSchemaMethods } from './runtime-contracts-schema.js';
import { createInputValidator as createInputValidatorImpl, createOutputValidator as createOutputValidatorImpl } from './runtime-contracts-wrapper.js';

export function createRuntimeContracts() {
  const schemas = new Map();
  const validation = createValidationMethods(schemas);
  const schema = createSchemaMethods();

  return {
    registerSchema(resourceType, resourceName, schemaObj) {
      const key = `${resourceType}:${resourceName}`;
      schemas.set(key, schemaObj);
      return this;
    },

    validateInput: validation.validateInput.bind(validation),
    validateOutput: validation.validateOutput.bind(validation),
    tryCoerce: validation.tryCoerce.bind(validation),
    generateSchemaFromJSDoc: schema.generateSchemaFromJSDoc.bind(schema),
    generateSchemaFromSignature: schema.generateSchemaFromSignature.bind(schema),

    createContractValidator(resourceType, resourceName) {
      return {
        validate: (input) => {
          const val = this.validateInput(resourceType, resourceName, input);
          if (!val.valid) {
            throw new Error(`Invalid input: ${val.errors.join(', ')}`);
          }
          return val.coerced;
        },
        validateOutput: (output) => {
          const val = this.validateOutput(resourceType, resourceName, output);
          if (!val.valid) {
            throw new Error(`Invalid output: ${val.errors.join(', ')}`);
          }
          return output;
        }
      };
    },

    createWithContract(resourceType, resourceName, fn) {
      const validator = this.createContractValidator(resourceType, resourceName);
      return async function contractEnforced(input) {
        const validatedInput = validator.validate(input);
        const result = await fn(validatedInput);
        return validator.validateOutput(result);
      };
    }
  };
}

export function createInputValidator(inputSchema) {
  const contracts = createRuntimeContracts();
  return createInputValidatorImpl(inputSchema, contracts);
}

export function createOutputValidator(outputSchema) {
  const contracts = createRuntimeContracts();
  return createOutputValidatorImpl(outputSchema, contracts);
}
