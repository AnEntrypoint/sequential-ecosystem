import path from 'path';
import { randomUUID } from 'crypto';
import { writeFileAtomicString } from '@sequential/file-operations';

export async function createResumableTaskExample(tasksDir) {
  const taskName = 'example-resumable-task';
  const taskFile = path.join(tasksDir, `${taskName}.js`);
  const taskId = randomUUID();
  const timestamp = new Date().toISOString();

  const code = `export const config = {
  name: '${taskName}',
  description: 'Large dataset batch processing with checkpoints and resumption',
  id: '${taskId}',
  created: '${timestamp}',
  runner: 'sequential-flow',
  timeout: 300000,
  retryCount: 5,
  checkpoint: true,
  inputs: [
    {
      name: 'datasetId',
      type: 'string',
      description: 'Dataset identifier',
      required: true
    },
    {
      name: 'batchSize',
      type: 'number',
      description: 'Records per batch',
      default: 100
    }
  ]
};

export async function example_resumable_task(input) {
  const { datasetId, batchSize = 100 } = input;

  if (!datasetId) {
    throw new Error('datasetId is required');
  }

  const metadata = await fetch(\`https://api.data.example.com/datasets/\${datasetId}/meta\`).then(r => r.json());

  if (!metadata.success) {
    throw new Error(\`Failed to get dataset metadata: \${metadata.error}\`);
  }

  const totalRecords = metadata.record_count;
  const totalBatches = Math.ceil(totalRecords / batchSize);

  const results = {
    datasetId,
    totalRecords,
    processedRecords: 0,
    failedRecords: 0,
    batches: []
  };

  for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
    const offset = batchNum * batchSize;

    const batchData = await fetch(\`https://api.data.example.com/datasets/\${datasetId}/records\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offset, limit: batchSize })
    }).then(r => r.json());

    if (!batchData.success) {
      results.failedRecords += batchSize;
      results.batches.push({ batch: batchNum, status: 'failed', error: batchData.error });
      continue;
    }

    const processedBatch = await fetch(\`https://api.processor.example.com/process\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        datasetId,
        batchNumber: batchNum,
        records: batchData.records
      })
    }).then(r => r.json());

    if (processedBatch.success) {
      results.processedRecords += batchData.records.length;
      results.batches.push({
        batch: batchNum,
        status: 'completed',
        recordsProcessed: batchData.records.length
      });
    } else {
      results.failedRecords += batchData.records.length;
      results.batches.push({
        batch: batchNum,
        status: 'failed',
        error: processedBatch.error
      });
    }
  }

  return {
    success: true,
    ...results,
    completionPercentage: Math.round((results.processedRecords / totalRecords) * 100),
    timestamp: new Date().toISOString()
  };
}`;

  await writeFileAtomicString(taskFile, code);
  console.log(`  ✓ example-resumable-task (batch processing with checkpoints)`);
}
