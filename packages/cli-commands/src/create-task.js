import path from 'path';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { ensureDirectory, writeFileAtomicString } from '@sequentialos/file-operations';
import { generateMachineTemplate } from './task-templates/machine.js';
import { generateFlowGraphTemplate } from './task-templates/flow-graph.js';
import { generateFlowSimpleTemplate } from './task-templates/flow-simple.js';
import { generateFlowMinimalTemplate } from './task-templates/flow-minimal.js';
import logger from '@sequentialos/sequential-logging';
import { nowISO, createTimestamps, updateTimestamp } from '@sequentialos/timestamp-utilities';

export async function createTask(options) {
  const { name, withGraph = false, inputs = [], description = '', runner = 'flow', minimal = false } = options;
  const tasksDir = path.resolve(process.cwd(), 'tasks');
  const taskFile = path.join(tasksDir, `${name}.js`);
  const taskDataDir = path.join(tasksDir, name);
  const runsDir = path.join(taskDataDir, 'runs');

  if (existsSync(taskFile)) {
    throw new Error(`Task '${name}' already exists at ${taskFile}`);
  }

  await ensureDirectory(tasksDir);
  await ensureDirectory(runsDir);

  const timestamp = nowISO();
  const taskId = randomUUID();

  let code;
  if (runner === 'machine') {
    code = generateMachineTemplate(name, taskId, timestamp, inputs, description);
  } else if (minimal) {
    code = generateFlowMinimalTemplate(name, taskId, timestamp, inputs, description);
  } else if (withGraph) {
    code = generateFlowGraphTemplate(name, taskId, timestamp, inputs, description);
  } else {
    code = generateFlowSimpleTemplate(name, taskId, timestamp, inputs, description);
  }

  await writeFileAtomicString(taskFile, code);

  logger.info(`✓ Task '${name}' created at ${taskFile}`);
  logger.info(`  - Runner: ${runner}`);
  logger.info(`  - Template: ${minimal ? 'minimal' : withGraph ? 'graph' : 'simple'}`);
  logger.info(`  - Edit ${taskFile} to write task logic`);
  logger.info(`  - Run with: npx sequential-ecosystem run ${name} --input '{}'`);
}
