/**
 * API input size and path validation
 */
export class InputValidator {
  constructor(maxTaskInputSize = 10 * 1024 * 1024, maxFlowDefinitionSize = 1 * 1024 * 1024) {
    this.maxTaskInputSize = maxTaskInputSize;
    this.maxFlowDefinitionSize = maxFlowDefinitionSize;
  }

  validateTaskInputSize(input, statusCodes) {
    const size = Buffer.byteLength(JSON.stringify(input));
    if (size > this.maxTaskInputSize) {
      return {
        valid: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `Task input exceeds maximum size of ${this.maxTaskInputSize / 1024 / 1024}MB`,
          statusCode: statusCodes.FILE_TOO_LARGE,
          size,
          limit: this.maxTaskInputSize
        }
      };
    }
    return { valid: true };
  }

  validateFlowDefinitionSize(flow, statusCodes) {
    const size = Buffer.byteLength(JSON.stringify(flow));
    if (size > this.maxFlowDefinitionSize) {
      return {
        valid: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `Flow definition exceeds maximum size of ${this.maxFlowDefinitionSize / 1024 / 1024}MB`,
          statusCode: statusCodes.FILE_TOO_LARGE,
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

  validateFilePath(path, statusCodes) {
    if (this.isPathTraversal(path)) {
      return {
        valid: false,
        error: {
          code: 'PATH_TRAVERSAL',
          message: 'Path contains traversal characters and is not allowed',
          statusCode: statusCodes.PATH_TRAVERSAL,
          path
        }
      };
    }
    return { valid: true };
  }
}
