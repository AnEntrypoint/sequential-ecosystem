import path from 'path';
import { ensureDirectory } from '@sequential/file-operations';
import { createSimpleFlowExample } from './examples/simple-flow.js';
import { createComplexFlowExample } from './examples/complex-flow.js';
import { createApiIntegrationExample } from './examples/api-integration.js';
import { createBatchProcessingExample } from './examples/batch-processing.js';
import { createPaymentFlowExample } from './examples/payment-flow.js';
import { createResumableTaskExample } from './examples/resumable-task.js';
import { createComprehensiveWorkflowExample } from './examples/comprehensive-workflow.js';
import { createExamplesReadme } from './examples/readme.js';
import { createExampleTools } from './examples/example-tools.js';
import { createExampleFlows } from './examples/example-flows.js';
import { createSequentialOSExample } from './examples/sequential-os-example.js';
import logger from '@sequential/sequential-logging';

export async function createExamples() {
  const tasksDir = path.join(process.cwd(), 'tasks');
  const toolsDir = path.join(process.cwd(), 'tools');

  await ensureDirectory(tasksDir);
  await ensureDirectory(toolsDir);

  logger.info('\n📚 Creating comprehensive examples...\n');

  logger.info('Creating example tasks:');
  const taskExamples = [
    createSimpleFlowExample,
    createComplexFlowExample,
    createApiIntegrationExample,
    createBatchProcessingExample,
    createPaymentFlowExample,
    createResumableTaskExample,
    createSequentialOSExample,
    createComprehensiveWorkflowExample
  ];

  for (const createExample of taskExamples) {
    await createExample(tasksDir);
  }

  logger.info('\nCreating example tools:');
  await createExampleTools(toolsDir);

  logger.info('\nCreating example flows:');
  createExampleFlows(tasksDir);

  createExamplesReadme(tasksDir);

  logger.info('\n✓ All examples created successfully!');
}
