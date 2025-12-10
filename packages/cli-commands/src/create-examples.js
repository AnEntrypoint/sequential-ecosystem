import path from 'path';
import { ensureDirectory } from '@sequential/file-operations';
import { createSimpleFlowExample } from './examples/simple-flow.js';
import { createComplexFlowExample } from './examples/complex-flow.js';
import { createApiIntegrationExample } from './examples/api-integration.js';
import { createBatchProcessingExample } from './examples/batch-processing.js';
import { createPaymentFlowExample } from './examples/payment-flow.js';
import { createResumableTaskExample } from './examples/resumable-task.js';
import { createComprehensiveWorkflowExample } from './examples/comprehensive-workflow.js';
import { createExampleFlowsCode } from './examples/example-flows-code.js';
import { createAdvancedPatternExamples } from './examples/example-advanced-patterns.js';
import { createExamplesReadme } from './examples/readme.js';
import { createExampleTools } from './examples/example-tools.js';
import { createAdvancedToolExamples } from './examples/example-advanced-tools.js';
import { createExampleFlows } from './examples/example-flows.js';
import { createSequentialOSExample } from './examples/sequential-os-example.js';
import { createExampleComponents } from './examples/example-components.js';
import { createExampleConfigs } from './examples/example-configs.js';
import { createExampleUtils } from './examples/example-utils.js';
import logger from '@sequential/sequential-logging';

export async function createExamples() {
  const rootDir = process.cwd();
  const tasksDir = path.join(rootDir, 'tasks');
  const toolsDir = path.join(rootDir, 'tools');

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

  logger.info('\nCreating advanced pattern examples:');
  await createAdvancedPatternExamples(tasksDir);

  logger.info('\nCreating example flows with code:');
  await createExampleFlowsCode(tasksDir);

  logger.info('\nCreating example tools:');
  await createExampleTools(toolsDir);

  logger.info('\nCreating advanced tool examples:');
  await createAdvancedToolExamples(toolsDir);

  logger.info('\nCreating utility helpers:');
  await createExampleUtils(toolsDir);

  logger.info('\nCreating example flow definitions:');
  createExampleFlows(tasksDir);

  logger.info('\nCreating example components:');
  await createExampleComponents(tasksDir);

  logger.info('\nCreating configuration examples:');
  await createExampleConfigs(rootDir);

  createExamplesReadme(tasksDir);

  logger.info('\n✓ All examples created successfully!');
}
