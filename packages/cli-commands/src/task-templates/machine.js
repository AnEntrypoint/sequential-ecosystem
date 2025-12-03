import logger from '@sequential/sequential-logging';
import { nowISO, createTimestamps, updateTimestamp } from '@sequential/timestamp-utilities';
export function generateMachineTemplate(name, taskId, timestamp, inputs, description) {
  const funcName = name.replace(/-/g, '_');
  const inputsDoc = inputs.length > 0
    ? inputs.map(i => `  * @param {*} input.${i} - ${i}`).join('\n')
    : '  * @param {*} input - Input parameters';

  return `/**
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
        params: ${JSON.stringify(inputs.length > 0 ? `{${inputs.map(i => `${i}: input.${i}`).join(', ')}}` : '{}')},
        timestamp: nowISO()
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(\`Service error: \${result.error || 'Unknown error'}\`);
    }

    const resultFile = 'service-result-' + Date.now() + '.json';
    fs.writeFileSync(resultFile, JSON.stringify({
      service: 'database',
      method: 'getData',
      params: ${JSON.stringify(inputs.length > 0 ? `{${inputs.map(i => `${i}: input.${i}`).join(', ')}}` : '{}')},
      result: result,
      timestamp: nowISO(),
      success: true
    }, null, 2));

    logger.info('💾 Service result written to: ' + resultFile);
  } catch (error) {
    logger.error('❌ Service call failed:', error.message);
    process.exit(1);
  }
}

callService();
"\`;

  logger.info('🔧 Calling database service...');
  const { execSync } = require('child_process');
  execSync(serviceCall, { stdio: 'inherit', cwd: process.cwd() });

  const fs = require('fs');
  const files = fs.readdirSync('.').filter(f => f.startsWith('service-result-'));

  logger.info(\`📄 Found \${files.length} service result files\`);

  const outputFile = 'task-output.json';
  fs.writeFileSync(outputFile, JSON.stringify({
    success: true,
    input,
    serviceResults: files.length,
    completedAt: nowISO()
  }, null, 2));

  logger.info(\`✅ Task completed - output written to \${outputFile}\`);

  return {
    success: true,
    input,
    serviceResults: files.length,
    outputFile
  };
}
`;
}
