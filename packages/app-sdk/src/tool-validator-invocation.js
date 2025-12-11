import { validateParameterSchema } from './tool-validator-parameters.js';
import { formatValidationError } from './tool-validator-formatter.js';

export function validateToolInvocation(toolName, params, schema) {
  if (!schema) {
    return {
      valid: true,
      toolName: toolName,
      message: 'No schema available (will validate at server)'
    };
  }

  const validation = validateParameterSchema(params, schema);

  return {
    valid: validation.valid,
    toolName: toolName,
    message: validation.valid ? 'Valid' : formatValidationError(toolName, validation),
    errors: validation.errors,
    warnings: validation.warnings
  };
}
