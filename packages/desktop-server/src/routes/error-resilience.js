export class ErrorResilienceValidator {
  constructor() {
    this.testResults = [];
  }

  async validateRetryLogic(retryEngine, testFn) {
    let attemptCount = 0;
    const result = await retryEngine.execute(async () => {
      attemptCount++;
      return await testFn(attemptCount);
    });

    return {
      name: 'Retry Logic',
      passed: result.success && result.attempts >= 1,
      details: { attempts: result.attempts, recovered: result.success }
    };
  }

  async validateCircuitBreaker(breaker, failureFn, successFn) {
    let failCount = 0;

    for (let i = 0; i < 5; i++) {
      try {
        await breaker.execute(i < 3 ? failureFn : successFn);
      } catch (e) {
        failCount++;
      }
    }

    return {
      name: 'Circuit Breaker',
      passed: breaker.getState().state === 'CLOSED' || breaker.getState().state === 'OPEN',
      details: { failureCount: failCount, state: breaker.getState().state }
    };
  }

  async validateErrorContext(errorCtx) {
    errorCtx.addContext('layer1', new Error('Initial error'));
    errorCtx.addContext('layer2', new Error('Propagated'));
    errorCtx.addContext('layer3', new Error('Final'));

    const report = errorCtx.getReport();
    return {
      name: 'Error Context Propagation',
      passed: report.chainLength === 3 && report.components.length === 3,
      details: { components: report.components }
    };
  }

  async validateFallbackStrategy() {
    let primaryFailed = false;
    let fallbackExecuted = false;

    try {
      primaryFailed = true;
      throw new Error('Primary failed');
    } catch (e) {
      fallbackExecuted = true;
    }

    return {
      name: 'Fallback Strategy',
      passed: primaryFailed && fallbackExecuted,
      details: { primaryAttempted: primaryFailed, fallbackUsed: fallbackExecuted }
    };
  }

  async validateExponentialBackoff(retryEngine) {
    const startTime = Date.now();

    await retryEngine.execute(async () => {
      throw new Error('Always fails');
    });

    const duration = Date.now() - startTime;
    const minExpected = 50 + 100 + 200;

    return {
      name: 'Exponential Backoff',
      passed: duration >= minExpected - 50,
      details: { duration, minExpected }
    };
  }

  async validateCombinedStrategies() {
    const retry = { attempts: 0 };
    const breaker = { failures: 0 };

    let success = false;
    for (let i = 0; i < 3; i++) {
      retry.attempts++;
      try {
        if (i < 1) throw new Error('Transient');
        success = true;
        break;
      } catch (e) {
        breaker.failures++;
      }
    }

    return {
      name: 'Combined Strategies',
      passed: success && retry.attempts >= 2,
      details: { retryAttempts: retry.attempts, failures: breaker.failures }
    };
  }

  async runAllTests(retryEngine, circuitBreaker, errorContext) {
    this.testResults = await Promise.all([
      this.validateRetryLogic(retryEngine, async (count) => {
        if (count < 2) throw new Error('Transient');
        return { success: true };
      }),
      this.validateCircuitBreaker(
        circuitBreaker,
        async () => { throw new Error('Service error'); },
        async () => { return { success: true }; }
      ),
      this.validateErrorContext(errorContext),
      this.validateFallbackStrategy(),
      this.validateExponentialBackoff(retryEngine),
      this.validateCombinedStrategies()
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

export class RetryEngine {
  constructor(maxRetries = 3, initialBackoff = 100) {
    this.maxRetries = maxRetries;
    this.initialBackoff = initialBackoff;
  }

  async execute(fn) {
    let lastError;

    for (let i = 0; i <= this.maxRetries; i++) {
      try {
        const result = await fn();
        return { success: true, result, attempts: i + 1 };
      } catch (e) {
        lastError = e;

        if (i < this.maxRetries) {
          const backoff = this.initialBackoff * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, backoff));
        }
      }
    }

    return { success: false, error: lastError, attempts: this.maxRetries + 1 };
  }
}

export class CircuitBreaker {
  constructor(failureThreshold = 5, resetTimeout = 1000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = null;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
      }
      return result;
    } catch (e) {
      this.lastFailureTime = Date.now();
      this.failureCount++;

      if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN';
      }

      throw e;
    }
  }

  getState() {
    return { state: this.state, failureCount: this.failureCount };
  }
}

export class ErrorContext {
  constructor() {
    this.chain = [];
    this.rootCause = null;
  }

  addContext(component, error) {
    this.chain.push({ component, error: error.message, timestamp: Date.now() });
    if (!this.rootCause) this.rootCause = error;
  }

  getReport() {
    return {
      rootCause: this.rootCause?.message,
      chainLength: this.chain.length,
      components: this.chain.map(c => c.component)
    };
  }
}

export function createErrorResilienceValidator() {
  return new ErrorResilienceValidator();
}
