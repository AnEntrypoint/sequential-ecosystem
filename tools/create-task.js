import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export async function createTask(options) {
  const { name, withGraph = false, inputs = [], description = '' } = options;
  const tasksDir = path.join(process.cwd(), 'tasks');
  const taskFile = path.join(tasksDir, `${name}.js`);
  const taskDataDir = path.join(tasksDir, name);
  const runsDir = path.join(taskDataDir, 'runs');

  if (fs.existsSync(taskFile)) {
    throw new Error(`Task '${name}' already exists at ${taskFile}`);
  }

  fs.mkdirSync(tasksDir, { recursive: true });
  fs.mkdirSync(runsDir, { recursive: true });

  const funcName = name.replace(/-/g, '_');
  const inputsDoc = inputs.length > 0
    ? inputs.map(i => `  * @param {*} input.${i} - ${i}`).join('\n')
    : '  * @param {*} input - Input parameters';

  const timestamp = new Date().toISOString();
  const taskId = randomUUID();

  if (withGraph) {
    const code = `/**
 * Task: ${name}
 * @description ${description || `Task: ${name}`}
 * @id ${taskId}
 * @created ${timestamp}
 * @inputs ${inputs.join(', ')}
 *
 * State machine: ${name}
 * Initial state: step1
 */

export const config = {
  name: '${name}',
  description: '${description || `Task: ${name}`}',
  id: '${taskId}',
  created: '${timestamp}',
  inputs: ${JSON.stringify(inputs.map(input => ({
    name: input,
    type: 'string',
    description: `Parameter: ${input}`
  })), null, 2).split('\n').map((line, i) => i === 0 ? line : '  ' + line).join('\n')}
};

export const graph = {
  id: '${name}',
  initial: 'step1',
  states: {
    step1: {
      description: 'First execution chunk',
      onDone: 'complete',
      onError: 'errorHandler'
    },
    errorHandler: { type: 'final' },
    complete: { type: 'final' }
  }
};

/**
 * First execution step
 * @param {*} input - Input parameters
 * @param {*} context - Execution context
 * @returns {Promise<*>} Step result
 */
export async function step1(input, context) {
  const result = await __callHostTool__('service', 'method', input);
  return result;
}

/**
 * Error handler
 * @param {*} error - Error object
 * @returns {Promise<{error: string}>} Error response
 */
export async function errorHandler(error) {
  console.error('Error:', error);
  return { error: error.message };
}
`;

    fs.writeFileSync(taskFile, code);
  } else {
    const code = `/**
 * Task: ${name}
 * @description ${description || `Task: ${name}`}
 * @id ${taskId}
 * @created ${timestamp}
 * @inputs ${inputs.join(', ')}
 */

export const config = {
  name: '${name}',
  description: '${description || `Task: ${name}`}',
  id: '${taskId}',
  created: '${timestamp}',
  inputs: ${JSON.stringify(inputs.map(input => ({
    name: input,
    type: 'string',
    description: `Parameter: ${input}`
  })), null, 2).split('\n').map((line, i) => i === 0 ? line : '  ' + line).join('\n')}
};

/**
 * Main task implementation
 * ${inputsDoc}
 * @returns {Promise<*>} Task result
 */
export async function ${funcName}(input) {
  // Task code here
  // Use fetch() for HTTP calls - they pause automatically
  // OR use __callHostTool__() for wrapped services

  return {
    success: true,
    input
  };
}
`;

    fs.writeFileSync(taskFile, code);
  }

  console.log(`✓ Task '${name}' created at ${taskFile}`);
  console.log(`  - Edit ${taskFile} to write task logic`);
  if (withGraph) {
    console.log(`  - Modify the graph export to define state transitions`);
  }
  console.log(`  - Run with: npx sequential-ecosystem run ${name} --input '{}'`);
}
