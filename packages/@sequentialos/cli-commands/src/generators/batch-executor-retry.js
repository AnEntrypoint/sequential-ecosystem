/**
 * Batch Executor Retry Engine
 * Retry logic with exponential backoff and timeout
 */

export function createRetryExecutor(retries, timeout) {
  return async function executeWithRetry(item, taskFn) {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await Promise.race([
          taskFn(item),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ]);
      } catch (error) {
        lastError = error;
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError;
  };
}
