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
    this.maxTaskInputSize = 10 * 1024 * 1024;
    this.maxFlowDefinitionSize = 1 * 1024 * 1024;
  }

  validateTaskInputSize(input) {
    const size = Buffer.byteLength(JSON.stringify(input));
    if (size > this.maxTaskInputSize) {
      return {
        valid: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `Task input exceeds maximum size of ${this.maxTaskInputSize / 1024 / 1024}MB`,
          statusCode: this.statusCodes.FILE_TOO_LARGE,
          size,
          limit: this.maxTaskInputSize
        }
      };
    }
    return { valid: true };
  }

  validateFlowDefinitionSize(flow) {
    const size = Buffer.byteLength(JSON.stringify(flow));
    if (size > this.maxFlowDefinitionSize) {
      return {
        valid: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `Flow definition exceeds maximum size of ${this.maxFlowDefinitionSize / 1024 / 1024}MB`,
          statusCode: this.statusCodes.FILE_TOO_LARGE,
          size,
          limit: this.maxFlowDefinitionSize
        }
      };
    }
    return { valid: true };
  }

  isPathTraversal(path) {
    if (!path || typeof path !== 'string') return false;
    const normalized = path.replace(/\\/g, '/');
    return /\.\./.test(normalized) || /%2e%2e/.test(path.toLowerCase());
  }

  validateFilePath(path) {
    if (this.isPathTraversal(path)) {
      return {
        valid: false,
        error: {
          code: 'PATH_TRAVERSAL',
          message: 'Path contains traversal characters and is not allowed',
          statusCode: this.statusCodes.PATH_TRAVERSAL,
          path
        }
      };
    }
    return { valid: true };
  }

  validateFlowInitial(flow) {
    if (!flow.initial) {
      return {
        valid: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Flow must have an initial state',
          statusCode: this.statusCodes.VALIDATION_ERROR,
          field: 'initial'
        }
      };
    }
    return { valid: true };
  }

  validateStateIds(states) {
    if (!Array.isArray(states)) {
      return { valid: true }; // Not an array, skip state ID validation
    }

    for (const state of states) {
      if (!state.id) {
        return {
          valid: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'All states must have an id property',
            statusCode: this.statusCodes.VALIDATION_ERROR,
            field: 'states[].id'
          }
        };
      }

      if (!/^[a-zA-Z0-9._-]+$/.test(state.id)) {
        return {
          valid: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `State id '${state.id}' contains invalid characters. Only alphanumeric, dots, underscores, and hyphens allowed`,
            statusCode: this.statusCodes.VALIDATION_ERROR,
            field: 'states[].id',
            value: state.id
          }
        };
      }
    }

    return { valid: true };
  }

  validateToolParameter(value, schema) {
    if (!schema) return { valid: true };

    if (schema.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        return {
          valid: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Expected number, got '${value}'`,
            statusCode: this.statusCodes.VALIDATION_ERROR,
            constraint: 'type',
            expected: 'number',
            received: typeof value
          }
        };
      }

      if (schema.minimum !== undefined && num < schema.minimum) {
        return {
          valid: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Value ${num} is less than minimum ${schema.minimum}`,
            statusCode: this.statusCodes.VALIDATION_ERROR,
            constraint: 'minimum',
            value: schema.minimum,
            received: num
          }
        };
      }

      if (schema.maximum !== undefined && num > schema.maximum) {
        return {
          valid: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Value ${num} exceeds maximum ${schema.maximum}`,
            statusCode: this.statusCodes.VALIDATION_ERROR,
            constraint: 'maximum',
            value: schema.maximum,
            received: num
          }
        };
      }

      return { valid: true };
    }

    if (schema.type === 'string') {
      if (typeof value !== 'string') {
        return {
          valid: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Expected string, got ${typeof value}`,
            statusCode: this.statusCodes.VALIDATION_ERROR,
            constraint: 'type',
            expected: 'string',
            received: typeof value
          }
        };
      }

      if (schema.minLength && value.length < schema.minLength) {
        return {
          valid: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `String length ${value.length} is less than minimum ${schema.minLength}`,
            statusCode: this.statusCodes.VALIDATION_ERROR,
            constraint: 'minLength',
            value: schema.minLength,
            received: value.length
          }
        };
      }

      if (schema.maxLength && value.length > schema.maxLength) {
        return {
          valid: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `String length ${value.length} exceeds maximum ${schema.maxLength}`,
            statusCode: this.statusCodes.VALIDATION_ERROR,
            constraint: 'maxLength',
            value: schema.maxLength,
            received: value.length
          }
        };
      }

      return { valid: true };
    }

    if (schema.type === 'array') {
      if (!Array.isArray(value)) {
        return {
          valid: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Expected array, got ${typeof value}`,
            statusCode: this.statusCodes.VALIDATION_ERROR,
            constraint: 'type',
            expected: 'array',
            received: typeof value
          }
        };
      }

      if (schema.minItems && value.length < schema.minItems) {
        return {
          valid: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Array has ${value.length} items, minimum is ${schema.minItems}`,
            statusCode: this.statusCodes.VALIDATION_ERROR,
            constraint: 'minItems',
            value: schema.minItems,
            received: value.length
          }
        };
      }

      if (schema.maxItems && value.length > schema.maxItems) {
        return {
          valid: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Array has ${value.length} items, maximum is ${schema.maxItems}`,
            statusCode: this.statusCodes.VALIDATION_ERROR,
            constraint: 'maxItems',
            value: schema.maxItems,
            received: value.length
          }
        };
      }

      return { valid: true };
    }

    return { valid: true };
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

export class RateLimiter {
  constructor(limit = 5, windowMs = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  check(identifier) {
    const now = Date.now();

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const times = this.requests.get(identifier);
    const validTimes = times.filter(t => now - t < this.windowMs);

    if (validTimes.length >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: Math.max(...validTimes) + this.windowMs
      };
    }

    validTimes.push(now);
    this.requests.set(identifier, validTimes);

    return {
      allowed: true,
      remaining: this.limit - validTimes.length,
      resetAt: now + this.windowMs,
      limit: this.limit
    };
  }

  reset(identifier) {
    this.requests.delete(identifier);
  }

  resetAll() {
    this.requests.clear();
  }
}

export function createAPIValidator() {
  return new APIValidator();
}

export function createRateLimiter(limit, windowMs) {
  return new RateLimiter(limit, windowMs);
}
