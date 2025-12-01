import path from 'path';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { ensureDirectory, writeFileAtomicString } from '@sequential/file-operations';
import { generateMachineTemplate } from './task-templates/machine.js';
import { generateFlowGraphTemplate } from './task-templates/flow-graph.js';
import { generateFlowSimpleTemplate } from './task-templates/flow-simple.js';

export async function createTask(options) {
  const { name, withGraph = false, inputs = [], description = '', runner = 'flow' } = options;
  const tasksDir = path.resolve(process.cwd(), 'tasks');
  const taskFile = path.join(tasksDir, `${name}.js`);
  const taskDataDir = path.join(tasksDir, name);
  const runsDir = path.join(taskDataDir, 'runs');

  if (existsSync(taskFile)) {
    throw new Error(`Task '${name}' already exists at ${taskFile}`);
  }

  await ensureDirectory(tasksDir);
  await ensureDirectory(runsDir);

  const timestamp = new Date().toISOString();
  const taskId = randomUUID();

  let code;
  if (runner === 'machine') {
    code = generateMachineTemplate(name, taskId, timestamp, inputs, description);
  } else if (withGraph) {
    code = generateFlowGraphTemplate(name, taskId, timestamp, inputs, description);
  } else {
    code = generateFlowSimpleTemplate(name, taskId, timestamp, inputs, description);
  }

  await writeFileAtomicString(taskFile, code);

  console.log(`✓ Task '${name}' created at ${taskFile}`);
  console.log(`  - Runner: ${runner}`);
  console.log(`  - Edit ${taskFile} to write task logic`);

  if (runner === 'machine') {
    console.log(`  - Run with: npx sequential-ecosystem run ${name} --input '{}'`);
    console.log(`  - Or use sequential-machine CLI directly`);
  } else {
    if (withGraph) {
      console.log(`  - Modify graph export to define state transitions`);
    }
    console.log(`  - Run with: npx sequential-ecosystem run ${name} --input '{}'`);
  }
}
