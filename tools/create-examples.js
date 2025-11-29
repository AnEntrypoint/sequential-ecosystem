import fs from 'fs';
import path from 'path';
import { createSimpleFlowExample } from './examples/simple-flow.js';
import { createComplexFlowExample } from './examples/complex-flow.js';
import { createApiIntegrationExample } from './examples/api-integration.js';
import { createBatchProcessingExample } from './examples/batch-processing.js';
import { createExamplesReadme } from './examples/readme.js';

export async function createExamples() {
  const tasksDir = path.join(process.cwd(), 'tasks');
  fs.mkdirSync(tasksDir, { recursive: true });

  const examples = [
    createSimpleFlowExample,
    createComplexFlowExample,
    createApiIntegrationExample,
    createBatchProcessingExample
  ];

  for (const createExample of examples) {
    await createExample(tasksDir);
  }

  createExamplesReadme(tasksDir);
}
