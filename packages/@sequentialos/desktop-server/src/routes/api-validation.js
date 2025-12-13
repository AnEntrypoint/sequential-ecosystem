import { InputValidator } from './api-input-validator.js';
import { validateFlowInitial, validateStateIds } from './api-flow-validator.js';
import { validateToolParameter } from './api-parameter-validator.js';
import { RateLimiter, createRateLimiter } from './api-rate-limiter.js';

/**
 * Facade maintaining 100% backward compatibility with APIValidator
 */
export class APIValidator {
  constructor() {
    this.statusCodes = {
      VALIDATION_ERROR: 422,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
      CONFLICT: 409,
      FILE_TOO_LARGE: 413,
      PATH_TRAVERSAL: 403,
      BAD_REQUEST: 400,
      INTERNAL_SERVER_ERROR: 500,
      RATE_LIMIT_EXCEEDED: 429
    };
    this.inputValidator = new InputValidator(10 * 1024 * 1024, 1 * 1024 * 1024);
  }

  validateTaskInputSize(input) {
    return this.inputValidator.validateTaskInputSize(input, this.statusCodes);
  }

  validateFlowDefinitionSize(flow) {
    return this.inputValidator.validateFlowDefinitionSize(flow, this.statusCodes);
  }

  isPathTraversal(path) {
    return this.inputValidator.isPathTraversal(path);
  }

  validateFilePath(path) {
    return this.inputValidator.validateFilePath(path, this.statusCodes);
  }

  validateFlowInitial(flow) {
    return validateFlowInitial(flow, this.statusCodes);
  }

  validateStateIds(states) {
    return validateStateIds(states, this.statusCodes);
  }

  validateToolParameter(value, schema) {
    return validateToolParameter(value, schema, this.statusCodes);
  }

  createErrorResponse(error) {
    return {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message,
      statusCode: error.statusCode || this.statusCodes.INTERNAL_SERVER_ERROR,
      ...(error.details && { details: error.details })
    };
  }

  getHTTPStatusCode(errorCode) {
    return this.statusCodes[errorCode] || 500;
  }
}

export { RateLimiter, createRateLimiter };

export function createAPIValidator() {
  return new APIValidator();
}
