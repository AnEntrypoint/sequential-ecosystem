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
  const taskDataDir = path.join(tasksDir, name);
  const codeFile = path.join(taskDataDir, 'code.js');
  const configFile = path.join(taskDataDir, 'config.json');
  const runsDir = path.join(taskDataDir, 'runs');
  const legacyFile = path.join(tasksDir, `${name}.js`);

  if (existsSync(codeFile) || existsSync(legacyFile)) {
    throw new Error(`Task '${name}' already exists`);
  }

  await ensureDirectory(tasksDir);
  await ensureDirectory(taskDataDir);
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

  const config = {
    name,
    description,
    id: taskId,
    created: timestamp,
    runner: runner === 'os' ? 'sequential-machine' : runner,
    type: runner === 'os' ? 'os' : null,
    inputs
  };

  await writeFileAtomicString(codeFile, code);
  await writeFileAtomicString(configFile, JSON.stringify(config, null, 2));

  logger.info(`✓ Task '${name}' created at ${taskDataDir}`);
  logger.info(`  - Runner: ${runner === 'os' ? 'sequential-machine (OS)' : runner}`);
  logger.info(`  - Template: ${templateType}`);
  logger.info(`  - Files: code.js, config.json, runs/`);
  logger.info(`  - Edit ${codeFile} to write task logic`);
  logger.info(`  - Run with: npx sequential-ecosystem run ${name} --input '{\"command\": \"apt update\"}'`);
}
