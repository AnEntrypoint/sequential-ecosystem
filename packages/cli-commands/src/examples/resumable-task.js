import path from 'path';
import { randomUUID } from 'crypto';
import { writeFileAtomicString } from '@sequential/file-operations';
import logger from '@sequential/sequential-logging';

export async function createResumableTaskExample(tasksDir) {
  const taskName = 'example-resumable-task';
  const taskFile = path.join(tasksDir, `${taskName}.js`);
  const taskId = randomUUID();
  const timestamp = new Date().toISOString();

  const code = `export const config = {
  name: '${taskName}',
  description: 'Large dataset processing with batch checkpoints',
  id: '${taskId}',
  created: '${timestamp}',
  runner: 'sequential-flow',
  inputs: [
    {
      name: 'totalRecords',
      type: 'number',
      description: 'Total records to process',
      default: 100
    },
    {
      name: 'batchSize',
      type: 'number',
      description: 'Records per batch',
      default: 25
    }
  ]
};

export async function example_resumable_task(input) {
  const { totalRecords = 100, batchSize = 25 } = input;

  if (totalRecords <= 0) throw new Error('totalRecords must be positive');
  if (batchSize <= 0) throw new Error('batchSize must be positive');

  const totalBatches = Math.ceil(totalRecords / batchSize);
  logger.info(\`Processing \${totalRecords} records in \${totalBatches} batches\`);

  const results = {
    totalRecords,
    batchSize,
    totalBatches,
    processedRecords: 0,
    failedRecords: 0,
    batches: []
  };

  for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
    const startIdx = batchNum * batchSize;
    const endIdx = Math.min(startIdx + batchSize, totalRecords);
    const batchRecords = endIdx - startIdx;

    logger.info(\`Batch \${batchNum + 1}/\${totalBatches}: Processing records \${startIdx}-\${endIdx}\`);

    const batchResults = [];
    for (let i = 0; i < batchRecords; i++) {
      const recordId = startIdx + i;
      batchResults.push({
        id: recordId,
        value: Math.random() * 100,
        processed: true,
        timestamp: new Date().toISOString()
      });
    }

    results.processedRecords += batchRecords;
    results.batches.push({
      batch: batchNum,
      startIdx,
      endIdx,
      recordsProcessed: batchRecords,
      status: 'completed',
      avgValue: batchResults.reduce((a, b) => a + b.value, 0) / batchRecords
    });
  }

  return {
    success: true,
    ...results,
    completionPercentage: 100,
    duration: Date.now(),
    timestamp: new Date().toISOString()
  };
}`;

  await writeFileAtomicString(taskFile, code);
  logger.info(`  ✓ example-resumable-task (batch processing with checkpoints)`);
}
