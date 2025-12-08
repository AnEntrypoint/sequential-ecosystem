export function createTaskDecorator() {
  return {
    withErrorRecovery(options = {}) {
      const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 30000,
        backoffMultiplier = 2,
        jitter = true,
        retryableErrors = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND']
      } = options;

      return (taskFn) => {
        return async function wrappedWithErrorRecovery(...args) {
          let lastError;
          let delay = initialDelay;

          for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
              return await taskFn(...args);
            } catch (error) {
              lastError = error;

              const isRetryable = retryableErrors.some(type =>
                error.code === type || error.message?.includes(type)
              );

              if (attempt === maxRetries || !isRetryable) {
                throw error;
              }

              const jitterMs = jitter ? Math.random() * 1000 : 0;
              const waitTime = Math.min(delay + jitterMs, maxDelay);
              await new Promise(r => setTimeout(r, waitTime));
              delay = Math.min(delay * backoffMultiplier, maxDelay);
            }
          }

          throw lastError;
        };
      };
    },

    withPerformanceTracking(options = {}) {
      const { namespace = 'task' } = options;

      return (taskFn) => {
        return async function wrappedWithTracking(...args) {
          const startTime = Date.now();
          const startMem = process.memoryUsage().heapUsed;

          try {
            const result = await taskFn(...args);
            const duration = Date.now() - startTime;
            const memUsed = process.memoryUsage().heapUsed - startMem;

            return {
              ...result,
              __metrics: { duration, memUsed, success: true, timestamp: new Date().toISOString() }
            };
          } catch (error) {
            const duration = Date.now() - startTime;
            const memUsed = process.memoryUsage().heapUsed - startMem;

            error.__metrics = { duration, memUsed, success: false, timestamp: new Date().toISOString() };
            throw error;
          }
        };
      };
    },

    withTimeout(ms = 30000) {
      return (taskFn) => {
        return async function wrappedWithTimeout(...args) {
          return Promise.race([
            taskFn(...args),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Task timeout after ${ms}ms`)), ms)
            )
          ]);
        };
      };
    },

    withLogging(options = {}) {
      const { level = 'info', prefix = '' } = options;

      return (taskFn) => {
        return async function wrappedWithLogging(...args) {
          const taskName = prefix || taskFn.name || 'anonymous';
          const startTime = Date.now();

          console.log(`[${level.toUpperCase()}] ${taskName} started`, { input: args[0] });

          try {
            const result = await taskFn(...args);
            const duration = Date.now() - startTime;
            console.log(`[${level.toUpperCase()}] ${taskName} completed in ${duration}ms`);
            return result;
          } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`[ERROR] ${taskName} failed after ${duration}ms`, error.message);
            throw error;
          }
        };
      };
    },

    withInputValidation(schema) {
      return (taskFn) => {
        return async function wrappedWithValidation(input) {
          const errors = validateAgainstSchema(input, schema);
          if (errors.length > 0) {
            const error = new Error(`Input validation failed: ${errors.join(', ')}`);
            error.code = 'VALIDATION_ERROR';
            error.details = errors;
            throw error;
          }

          return await taskFn(input);
        };
      };
    },

    withCaching(options = {}) {
      const { ttl = 60000, keyFn = (input) => JSON.stringify(input) } = options;
      const cache = new Map();

      return (taskFn) => {
        return async function wrappedWithCaching(input) {
          const key = keyFn(input);
          const cached = cache.get(key);

          if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.value;
          }

          const result = await taskFn(input);
          cache.set(key, { value: result, timestamp: Date.now() });

          if (cache.size > 100) {
            const oldestKey = Array.from(cache.entries())
              .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
            cache.delete(oldestKey);
          }

          return result;
        };
      };
    },

    compose(...decorators) {
      return (taskFn) => {
        return decorators.reduce((fn, decorator) => decorator(fn), taskFn);
      };
    }
  };
}

function validateAgainstSchema(input, schema) {
  const errors = [];

  if (schema.type === 'object' && input && typeof input === 'object') {
    for (const [key, constraint] of Object.entries(schema.properties || {})) {
      const value = input[key];

      if (constraint.required && value === undefined) {
        errors.push(`${key} is required`);
      }

      if (constraint.type && value !== undefined && typeof value !== constraint.type) {
        errors.push(`${key} must be ${constraint.type}`);
      }

      if (constraint.minLength && value?.length < constraint.minLength) {
        errors.push(`${key} must be at least ${constraint.minLength} characters`);
      }

      if (constraint.minimum !== undefined && value < constraint.minimum) {
        errors.push(`${key} must be >= ${constraint.minimum}`);
      }

      if (constraint.enum && !constraint.enum.includes(value)) {
        errors.push(`${key} must be one of: ${constraint.enum.join(', ')}`);
      }
    }
  }

  return errors;
}
