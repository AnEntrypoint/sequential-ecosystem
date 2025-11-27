import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

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

  const funcName = name.replace(/-/g, '_');
  const inputsDoc = inputs.length > 0
    ? inputs.map(i => `  * @param {*} input.${i} - ${i}`).join('\n')
    : '  * @param {*} input - Input parameters';

  const timestamp = new Date().toISOString();
  const taskId = randomUUID();

  if (runner === 'machine') {
    // Sequential Machine task - uses filesystem-based execution
    const code = `/**
 * Task: ${name}
 * @description ${description || `Task: ${name}`}
 * @id ${taskId}
 * @created ${timestamp}
 * @inputs ${inputs.join(', ')}
 * @runner sequential-machine
 */

export const config = {
  name: '${name}',
  description: '${description || `Task: ${name}`}',
  id: '${taskId}',
  created: '${timestamp}',
  runner: 'sequential-machine',
  inputs: ${JSON.stringify(inputs.map(input => ({
    name: input,
    type: 'string',
    description: `Parameter: ${input}`
  })), null, 2).split('\n').map((line, i) => i === 0 ? line : '  ' + line).join('\n')}
};

/**
 * Main task implementation for Sequential Machine
 * ${inputsDoc}
 * @returns {Promise<*>} Task result
 */
export async function ${funcName}(input) {
  // Sequential Machine task - filesystem-based execution
  // All commands create filesystem changes → automatic checkpoints
  
  // Example: Call a wrapped service
  // This creates a file → triggers checkpoint
  const serviceCall = \`node -e "
const fs = require('fs');
const path = require('path');

async function callService() {
  try {
    const response = await fetch('http://localhost:3101/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'getData',
        params: ${JSON.stringify(input)},
        timestamp: new Date().toISOString()
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(\`Service error: \${result.error || 'Unknown error'}\`);
    }
    
    // Write result to file - creates filesystem change → checkpoint
    const resultFile = 'service-result-' + Date.now() + '.json';
    fs.writeFileSync(resultFile, JSON.stringify({
      service: 'database',
      method: 'getData',
      params: ${JSON.stringify(input)},
      result: result,
      timestamp: new Date().toISOString(),
      success: true
    }, null, 2));
    
    console.log('💾 Service result written to: ' + resultFile);
  } catch (error) {
    console.error('❌ Service call failed:', error.message);
    process.exit(1);
  }
}

callService();
"\`;
  
  // Execute service call - creates checkpoint
  console.log('🔧 Calling database service...');
  const { execSync } = require('child_process');
  execSync(serviceCall, { stdio: 'inherit', cwd: process.cwd() });
  
  // Example: Process files
  const fs = require('fs');
  const files = fs.readdirSync('.').filter(f => f.startsWith('service-result-'));
  
  console.log(\`📄 Found \${files.length} service result files\`);
  
  // Example: Create output file
  const outputFile = 'task-output.json';
  fs.writeFileSync(outputFile, JSON.stringify({
    success: true,
    input,
    serviceResults: files.length,
    completedAt: new Date().toISOString()
  }, null, 2));
  
  console.log(\`✅ Task completed - output written to \${outputFile}\`);
  
  return {
    success: true,
    input,
    serviceResults: files.length,
    outputFile
  };
}
`;

    fs.writeFileSync(taskFile, code);
  } else if (withGraph) {
    // Flow-based task with state graph
    const code = `/**
 * Task: ${name}
 * @description ${description || `Task: ${name}`}
 * @id ${taskId}
 * @created ${timestamp}
 * @inputs ${inputs.join(', ')}
 * @runner sequential-flow
 *
 * State machine: ${name}
 * Initial state: step1
 */

export const config = {
  name: '${name}',
  description: '${description || `Task: ${name}`}',
  id: '${taskId}',
  created: '${timestamp}',
  runner: 'sequential-flow',
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
    // Simple flow-based task
    const code = `/**
 * Task: ${name}
 * @description ${description || `Task: ${name}`}
 * @id ${taskId}
 * @created ${timestamp}
 * @inputs ${inputs.join(', ')}
 * @runner sequential-flow
 */

export const config = {
  name: '${name}',
  description: '${description || `Task: ${name}`}',
  id: '${taskId}',
  created: '${timestamp}',
  runner: 'sequential-flow',
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
  // Flow-based task - uses sequential-runner
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
