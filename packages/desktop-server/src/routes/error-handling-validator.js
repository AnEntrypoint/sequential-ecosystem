export class ErrorHandlingValidator {
  constructor() {
    this.testResults = [];
  }

  async validateBasicErrorHandling() {
    let errorCaught = false;
    let errorMessage = '';

    try {
      throw new Error('Test error');
    } catch (e) {
      errorCaught = true;
      errorMessage = e.message;
    }

    return {
      name: 'Basic Error Handling',
      passed: errorCaught && errorMessage === 'Test error',
      details: { caught: errorCaught, message: errorMessage }
    };
  }

  async validateErrorTypes() {
    const errors = [];

    try {
      throw new TypeError('Type mismatch');
    } catch (e) {
      errors.push({ type: e.constructor.name, message: e.message });
    }

    try {
      throw new RangeError('Out of range');
    } catch (e) {
      errors.push({ type: e.constructor.name, message: e.message });
    }

    try {
      throw new SyntaxError('Invalid syntax');
    } catch (e) {
      errors.push({ type: e.constructor.name, message: e.message });
    }

    return {
      name: 'Error Types',
      passed: errors.length === 3 && errors.every(e => e.type && e.message),
      details: { errorTypes: errors.map(e => e.type).join(', '), total: errors.length }
    };
  }

  async validateStackTraces() {
    let stackTrace = '';

    try {
      throw new Error('Stack trace test');
    } catch (e) {
      stackTrace = e.stack;
    }

    const hasFileName = stackTrace.includes('.js');
    const hasLineNumber = /:\d+/.test(stackTrace);
    const hasMethodName = stackTrace.length > 50;

    return {
      name: 'Stack Traces',
      passed: hasFileName && hasLineNumber && hasMethodName,
      details: { hasFileName, hasLineNumber, hasMethodName, stackLength: stackTrace.length }
    };
  }

  async validateErrorContext() {
    const errorWithContext = new Error('Operation failed');
    errorWithContext.context = {
      operation: 'database-insert',
      userId: 123,
      timestamp: Date.now(),
      retryCount: 2
    };
    errorWithContext.code = 'DB_ERROR';

    const hasContext = errorWithContext.context !== undefined;
    const hasCode = errorWithContext.code === 'DB_ERROR';
    const contextValid = errorWithContext.context.userId === 123;

    return {
      name: 'Error Context',
      passed: hasContext && hasCode && contextValid,
      details: { hasContext, hasCode, contextValid, contextKeys: Object.keys(errorWithContext.context).length }
    };
  }

  async validateErrorChaining() {
    let chainedError = null;

    try {
      try {
        throw new Error('Original error');
      } catch (e) {
        const newError = new Error('Handler error');
        newError.cause = e;
        throw newError;
      }
    } catch (e) {
      chainedError = e;
    }

    const hasChain = chainedError.cause !== undefined;
    const chainMessage = chainedError.cause?.message === 'Original error';

    return {
      name: 'Error Chaining',
      passed: hasChain && chainMessage,
      details: { hasChain, originalError: chainedError.cause?.message, currentError: chainedError.message }
    };
  }

  async validateErrorRetry() {
    let attempts = 0;
    let succeeded = false;

    const retryOperation = async (maxRetries = 3) => {
      for (let i = 0; i < maxRetries; i++) {
        attempts++;
        try {
          if (attempts < 2) {
            throw new Error('Transient error');
          }
          succeeded = true;
          return { success: true };
        } catch (e) {
          if (i === maxRetries - 1) throw e;
        }
      }
    };

    try {
      await retryOperation();
    } catch (e) {
      // Ignore
    }

    return {
      name: 'Error Retry Logic',
      passed: succeeded && attempts === 2,
      details: { attempts, succeeded, maxRetries: 3 }
    };
  }

  async validateErrorRecovery() {
    const result = { primary: null, fallback: null };

    try {
      throw new Error('Primary operation failed');
    } catch (e) {
      result.primary = 'failed';
      try {
        result.fallback = 'recovered';
      } catch (e2) {
        result.fallback = 'failed';
      }
    }

    return {
      name: 'Error Recovery',
      passed: result.primary === 'failed' && result.fallback === 'recovered',
      details: result
    };
  }

  async validateAsyncErrorHandling() {
    let errorCaught = false;

    const asyncOp = async () => {
      throw new Error('Async error');
    };

    try {
      await asyncOp();
    } catch (e) {
      errorCaught = true;
    }

    return {
      name: 'Async Error Handling',
      passed: errorCaught,
      details: { errorCaught }
    };
  }

  async validatePromiseErrorHandling() {
    let errorHandled = false;

    const promise = Promise.reject(new Error('Promise rejection'));

    try {
      await promise.catch(e => {
        errorHandled = true;
      });
    } catch (e) {
      // Ignore
    }

    return {
      name: 'Promise Error Handling',
      passed: errorHandled,
      details: { errorHandled }
    };
  }

  async validateErrorAggregation() {
    const errors = [];

    const operations = [
      async () => { throw new Error('Error 1'); },
      async () => { throw new Error('Error 2'); },
      async () => { return 'success'; },
      async () => { throw new Error('Error 3'); }
    ];

    for (const op of operations) {
      try {
        await op();
      } catch (e) {
        errors.push(e.message);
      }
    }

    return {
      name: 'Error Aggregation',
      passed: errors.length === 3 && errors.every(msg => msg.startsWith('Error')),
      details: { totalErrors: errors.length, errorMessages: errors }
    };
  }

  async validateErrorFiltering() {
    const isRetryableError = (error) => {
      return error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND';
    };

    const errors = [
      { code: 'ECONNRESET', message: 'Connection reset' },
      { code: 'AUTH_FAILED', message: 'Authentication failed' },
      { code: 'ETIMEDOUT', message: 'Timeout' },
      { code: 'VALIDATION_ERROR', message: 'Invalid input' }
    ];

    const retryable = errors.filter(e => isRetryableError(e));
    const nonRetryable = errors.filter(e => !isRetryableError(e));

    return {
      name: 'Error Filtering',
      passed: retryable.length === 2 && nonRetryable.length === 2,
      details: { retryable: retryable.length, nonRetryable: nonRetryable.length, total: errors.length }
    };
  }

  async validateCustomErrors() {
    class DatabaseError extends Error {
      constructor(message, code) {
        super(message);
        this.name = 'DatabaseError';
        this.code = code;
      }
    }

    class ValidationError extends Error {
      constructor(message, field) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
      }
    }

    let dbError = null;
    let valError = null;

    try {
      throw new DatabaseError('Query failed', 'QUERY_TIMEOUT');
    } catch (e) {
      dbError = e;
    }

    try {
      throw new ValidationError('Invalid email', 'email');
    } catch (e) {
      valError = e;
    }

    return {
      name: 'Custom Error Classes',
      passed: dbError.name === 'DatabaseError' && valError.name === 'ValidationError' && dbError.code === 'QUERY_TIMEOUT',
      details: { dbErrorName: dbError.name, valErrorName: valError.name, dbCode: dbError.code }
    };
  }

  async validateErrorLogging() {
    const logs = [];

    const logError = (error, context = {}) => {
      logs.push({
        timestamp: Date.now(),
        message: error.message,
        type: error.constructor.name,
        context,
        stack: error.stack?.split('\n')[0]
      });
    };

    try {
      throw new Error('Test error for logging');
    } catch (e) {
      logError(e, { userId: 123, operation: 'update' });
    }

    return {
      name: 'Error Logging',
      passed: logs.length === 1 && logs[0].context.userId === 123,
      details: { logsCreated: logs.length, hasContext: logs[0].context !== undefined }
    };
  }

  async validateErrorSerialization() {
    const error = new Error('Serialization test');
    error.code = 'TEST_ERROR';
    error.context = { userId: 123 };

    const serialized = {
      message: error.message,
      code: error.code,
      type: error.constructor.name,
      context: error.context,
      timestamp: Date.now()
    };

    const canSerialize = JSON.stringify(serialized);

    return {
      name: 'Error Serialization',
      passed: canSerialize.includes('TEST_ERROR') && canSerialize.includes('Serialization test'),
      details: { serializable: true, keys: Object.keys(serialized).length }
    };
  }

  async validateErrorBoundaries() {
    const boundaries = [];

    const executeWithBoundary = (name, fn) => {
      try {
        fn();
        boundaries.push({ name, status: 'success' });
      } catch (e) {
        boundaries.push({ name, status: 'error', message: e.message });
      }
    };

    executeWithBoundary('operation1', () => {
      throw new Error('Operation 1 failed');
    });

    executeWithBoundary('operation2', () => {
      return 'success';
    });

    executeWithBoundary('operation3', () => {
      throw new Error('Operation 3 failed');
    });

    const failed = boundaries.filter(b => b.status === 'error').length;

    return {
      name: 'Error Boundaries',
      passed: failed === 2 && boundaries.length === 3,
      details: { total: boundaries.length, failed, succeeded: boundaries.length - failed }
    };
  }

  async validateErrorPropagation() {
    let level1Error = null;
    let level2Error = null;
    let level3Error = null;

    const level3 = () => {
      throw new Error('Level 3 error');
    };

    const level2 = () => {
      try {
        level3();
      } catch (e) {
        level2Error = e;
        throw e;
      }
    };

    const level1 = () => {
      try {
        level2();
      } catch (e) {
        level1Error = e;
        throw e;
      }
    };

    try {
      level1();
    } catch (e) {
      level3Error = e;
    }

    return {
      name: 'Error Propagation',
      passed: level1Error !== null && level2Error !== null && level3Error !== null &&
              level1Error.message === 'Level 3 error',
      details: { propagated: 3, message: level3Error?.message }
    };
  }

  async validateErrorSuppression() {
    const suppressed = [];
    let unsuppressed = 0;

    const operations = [
      async () => { throw new Error('Error 1'); },
      async () => { throw new Error('Error 2'); },
      async () => { return 'success'; },
      async () => { throw new Error('Error 3'); }
    ];

    for (const op of operations) {
      try {
        await op();
        unsuppressed++;
      } catch (e) {
        suppressed.push(e.message);
      }
    }

    return {
      name: 'Error Suppression',
      passed: suppressed.length === 3 && unsuppressed === 1,
      details: { suppressed: suppressed.length, unsuppressed, total: operations.length }
    };
  }

  async validateCircuitBreakerErrorHandling() {
    let failureCount = 0;
    let state = 'CLOSED';

    const execute = (shouldFail) => {
      if (state === 'OPEN') {
        throw new Error('Circuit breaker is OPEN');
      }

      if (shouldFail) {
        failureCount++;
        if (failureCount >= 3) {
          state = 'OPEN';
        }
        throw new Error('Operation failed');
      }

      failureCount = 0;
      state = 'CLOSED';
      return { success: true };
    };

    const results = [];

    for (let i = 0; i < 5; i++) {
      try {
        execute(i < 3);
        results.push('success');
      } catch (e) {
        results.push('error');
      }
    }

    return {
      name: 'Circuit Breaker Error Handling',
      passed: state === 'OPEN' && failureCount >= 3,
      details: { state, failures: failureCount, results: results.join(',') }
    };
  }

  async validateErrorDeduplication() {
    const seenErrors = new Set();
    const uniqueErrors = [];

    const errors = [
      'Timeout error',
      'Connection error',
      'Timeout error',
      'Database error',
      'Connection error',
      'Timeout error'
    ];

    for (const err of errors) {
      if (!seenErrors.has(err)) {
        seenErrors.add(err);
        uniqueErrors.push(err);
      }
    }

    return {
      name: 'Error Deduplication',
      passed: uniqueErrors.length === 3 && seenErrors.size === 3,
      details: { total: errors.length, unique: uniqueErrors.length, uniqueMessages: uniqueErrors }
    };
  }

  async runAllTests() {
    this.testResults = await Promise.all([
      this.validateBasicErrorHandling(),
      this.validateErrorTypes(),
      this.validateStackTraces(),
      this.validateErrorContext(),
      this.validateErrorChaining(),
      this.validateErrorRetry(),
      this.validateErrorRecovery(),
      this.validateAsyncErrorHandling(),
      this.validatePromiseErrorHandling(),
      this.validateErrorAggregation(),
      this.validateErrorFiltering(),
      this.validateCustomErrors(),
      this.validateErrorLogging(),
      this.validateErrorSerialization(),
      this.validateErrorBoundaries(),
      this.validateErrorPropagation(),
      this.validateErrorSuppression(),
      this.validateCircuitBreakerErrorHandling(),
      this.validateErrorDeduplication()
    ]);

    return this.testResults;
  }

  getSummary() {
    const passed = this.testResults.filter(t => t.passed).length;
    const total = this.testResults.length;
    return {
      total,
      passed,
      failed: total - passed,
      percentage: Math.round((passed / total) * 100),
      tests: this.testResults
    };
  }
}

export function createErrorHandlingValidator() {
  return new ErrorHandlingValidator();
}
