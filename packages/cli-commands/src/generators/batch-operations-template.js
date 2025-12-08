export function generateTaskBatcherTemplate() {
  return `/**
 * Task Batcher
 *
 * Distribute items across batches for parallel processing.
 */

import { createTaskBatcher } from '@sequential/batch-operations';

const batcher = createTaskBatcher();

// Batch by size (e.g., 100 items per batch)
export async function processInBatches(items) {
  return await batcher.batchBySize(items, 100, 'process-items');
}

// Batch by partition count (e.g., 4 parallel batches)
export async function processInPartitions(items, partitionCount = 4) {
  return await batcher.batchByCount(items, partitionCount, 'process-items');
}
`;
}
