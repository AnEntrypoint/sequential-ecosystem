import path from 'path';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { ensureDirectory, writeFileAtomicString } from '@sequentialos/file-operations';
import { generateMachineTemplate } from './task-templates/machine.js';
import { generateFlowGraphTemplate } from './task-templates/flow-graph.js';
import { generateFlowSimpleTemplate } from './task-templates/flow-simple.js';
import { generateFlowMinimalTemplate } from './task-templates/flow-minimal.js';
import { generateOSTaskTemplate } from './task-templates/os-task.js';
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
  let templateType = 'simple';

  if (runner === 'os') {
    code = generateOSTaskTemplate(name, taskId, timestamp, inputs, description);
    templateType = 'os';
  } else if (runner === 'machine') {
    code = generateMachineTemplate(name, taskId, timestamp, inputs, description);
    templateType = 'machine';
  } else if (minimal) {
    code = generateFlowMinimalTemplate(name, taskId, timestamp, inputs, description);
    templateType = 'minimal';
  } else if (withGraph) {
    code = generateFlowGraphTemplate(name, taskId, timestamp, inputs, description);
    templateType = 'graph';
  } else {
    code = generateFlowSimpleTemplate(name, taskId, timestamp, inputs, description);
    templateType = 'simple';
  }

  await writeFileAtomicString(taskFile, code);

  logger.info(`✓ Task '${name}' created at ${taskFile}`);
  logger.info(`  - Runner: ${runner === 'os' ? 'sequential-machine (OS)' : runner}`);
  logger.info(`  - Template: ${templateType}`);
  logger.info(`  - Edit ${taskFile} to write task logic`);
  logger.info(`  - Run with: npx sequential-ecosystem run ${name} --input '{command: "apt update"}'`);
}
