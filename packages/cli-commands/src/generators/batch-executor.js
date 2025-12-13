/**
 * Batch Executor
 * Executes batch operations with retry and concurrency control
 *
 * Delegates to:
 * - batch-executor-retry: Retry logic with exponential backoff
 * - batch-executor-strategies: Sequential, parallel, and batched strategies
 */

import { createRetryExecutor } from './batch-executor-retry.js';
import { createExecutionStrategies } from './batch-executor-strategies.js';

export function createBatchExecutor(options = {}) {
  const {
    concurrency = 5,
    timeout = 30000,
    retries = 0,
    continueOnError = false
  } = options;

  const executeWithRetry = createRetryExecutor(retries, timeout);
  const strategies = createExecutionStrategies({ continueOnError }, executeWithRetry);

  return {
    async executeSequential(items, taskFn) {
      return strategies.executeSequential(items, taskFn);
    },

    async executeParallel(items, taskFn) {
      return strategies.executeParallel(items, taskFn, concurrency);
    },

    async executeBatched(items, batchSize, taskFn) {
      return strategies.executeBatched(items, batchSize, taskFn, concurrency);
    }
  };
}
