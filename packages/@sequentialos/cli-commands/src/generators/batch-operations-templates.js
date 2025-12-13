export function generateBatchOperationsTemplate() {
  return `/**
 * Batch Operations
 *
 * Execute multiple tasks efficiently.
 * Strategies: sequential, parallel, batched with retries.
 */

import { createBatchExecutor } from '@sequentialos/batch-operations';

const executor = createBatchExecutor({
  concurrency: 5,
  timeout: 30000,
  retries: 2,
  continueOnError: true
});

// Process items sequentially
export async function processSequential(items) {
  return await executor.executeSequential(items, async (item) => {
    const result = await __callHostTool__('task', 'processItem', item);
    return result;
  });
}

// Process items in parallel
export async function processParallel(items) {
  return await executor.executeParallel(items, async (item) => {
    const result = await __callHostTool__('task', 'processItem', item);
    return result;
  });
}

// Process items in batches
export async function processBatched(items, batchSize = 10) {
  return await executor.executeBatched(items, batchSize, async (item) => {
    const result = await __callHostTool__('task', 'processItem', item);
    return result;
  });
}

// Batch import
export async function importUsers(csvPath) {
  const items = await readCSV(csvPath);

  return await executor.executeBatched(items, 50, async (user) => {
    return await __callHostTool__('task', 'createUser', user);
  });
}
`;
}
