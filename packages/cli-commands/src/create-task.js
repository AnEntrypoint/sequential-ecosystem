import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { generateMachineTemplate } from './task-templates/machine.js';
import { generateFlowGraphTemplate } from './task-templates/flow-graph.js';
import { generateFlowSimpleTemplate } from './task-templates/flow-simple.js';

export async function createTask(options) {
  const { name, withGraph = false, inputs = [], description = '', runner = 'flow' } = options;
  const tasksDir = path.join(process.cwd(), 'tasks');
  const taskFile = path.join(tasksDir, `${name}.js`);
  const taskDataDir = path.join(tasksDir, name);
  const runsDir = path.join(taskDataDir, 'runs');

  if (fs.existsSync(taskFile)) {
    throw new Error(`Task '${name}' already exists at ${taskFile}`);
  }

  fs.mkdirSync(tasksDir, { recursive: true });
  fs.mkdirSync(runsDir, { recursive: true });

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

  fs.writeFileSync(taskFile, code);

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
