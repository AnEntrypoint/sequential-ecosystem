import path from 'path';
import { randomUUID } from 'crypto';
import { writeFileAtomicString } from '@sequentialos/file-operations';
import logger from '@sequentialos/sequential-logging';
import { nowISO, createTimestamps, updateTimestamp } from '@sequentialos/timestamp-utilities';
import { delay, withRetry } from '@sequentialos/async-patterns';

export async function createBatchProcessingExample(tasksDir) {
  const taskName = 'example-batch-processing';
  const taskFile = path.join(tasksDir, `${taskName}.js`);
  const taskId = randomUUID();
  const timestamp = nowISO();

  const code = `export const config = {
  name: '${taskName}',
  description: 'Batch processing with concurrency control and progress tracking',
  id: '${taskId}',
  created: '${timestamp}',
  runner: 'sequential-flow',
  inputs: [
    {
      name: 'items',
      type: 'array',
      description: 'Items to process in batches',
      default: Array.from({ length: 10 }, (_, i) => \`item-\${i + 1}\`)
    },
    {
      name: 'batchSize',
      type: 'number',
      description: 'Items per batch',
      default: 3
    },
    {
      name: 'concurrency',
      type: 'number',
      description: 'Concurrent operations',
      default: 2
    }
  ]
};

async function processBatch(batch, batchIndex) {
  logger.info(\`Processing batch \${batchIndex + 1} with \${batch.length} items\`);

  const results = await Promise.all(
    batch.map(async (item, index) => {
      const response = await fetch(\`https://httpbin.org/delay/0\`);
      const data = await response.json();

      return {
        item,
        batchIndex,
        itemIndex: index,
        processed: item.toUpperCase(),
        timestamp: nowISO(),
        url: data.url
      };
    })
  );

  return results;
}

async function processWithConcurrency(batches, concurrency) {
  const results = [];
  const executing = [];

  for (const [index, batch] of batches.entries()) {
    const promise = processBatch(batch, index).then(result => {
      executing.splice(executing.indexOf(promise), 1);
      return result;
    });

    results.push(promise);
    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

export async function example_batch_processing(input) {
  const {
    items = Array.from({ length: 10 }, (_, i) => \`item-\${i + 1}\`),
    batchSize = 3,
    concurrency = 2
  } = input;

  logger.info(\`Processing \${items.length} items in batches of \${batchSize} with concurrency \${concurrency}\`);

  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  logger.info(\`Created \${batches.length} batches\`);

  const startTime = Date.now();
  const batchResults = await processWithConcurrency(batches, concurrency);
  const endTime = Date.now();

  const allResults = batchResults.flat();

  const result = {
    success: true,
    totalItems: items.length,
    batchSize,
    concurrency,
    totalBatches: batches.length,
    processedItems: allResults.length,
    duration: endTime - startTime,
    averageTimePerItem: (endTime - startTime) / allResults.length,
    results: allResults,
    timestamp: nowISO()
  };

  logger.info(\`Completed \${allResults.length} items in \${result.duration}ms\`);

  return result;
}
`;

  await writeFileAtomicString(taskFile, code);
  logger.info(`✓ Created ${taskName}`);
}
