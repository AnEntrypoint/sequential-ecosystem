import path from 'path';
import { ensureDirectory } from '@sequential/file-operations';
import { createSimpleFlowExample } from './examples/simple-flow.js';
import { createComplexFlowExample } from './examples/complex-flow.js';
import { createApiIntegrationExample } from './examples/api-integration.js';
import { createBatchProcessingExample } from './examples/batch-processing.js';
import { createExamplesReadme } from './examples/readme.js';
import { createExampleTools } from './examples/example-tools.js';
import { createExampleFlows } from './examples/example-flows.js';
import { createSequentialOSExample } from './examples/sequential-os-example.js';

export async function createExamples() {
  const tasksDir = path.join(process.cwd(), 'tasks');
  const toolsDir = path.join(process.cwd(), 'tools');

  await ensureDirectory(tasksDir);
  await ensureDirectory(toolsDir);

  console.log('\n📚 Creating comprehensive examples...\n');

  console.log('Creating example tasks:');
  const taskExamples = [
    createSimpleFlowExample,
    createComplexFlowExample,
    createApiIntegrationExample,
    createBatchProcessingExample,
    createSequentialOSExample
  ];

  for (const createExample of taskExamples) {
    await createExample(tasksDir);
  }

  console.log('\nCreating example tools:');
  await createExampleTools(toolsDir);

  console.log('\nCreating example flows:');
  createExampleFlows(tasksDir);

  createExamplesReadme(tasksDir);

  console.log('\n✓ All examples created successfully!');
}
