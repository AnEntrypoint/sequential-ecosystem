import logger from '@sequentialos/sequential-logging';
import { nowISO } from '@sequentialos/timestamp-utilities';

export function generateOSTaskTemplate(name, taskId, timestamp, inputs, description) {
  const funcName = name.replace(/-/g, '_');
  const inputsDoc = inputs.length > 0
    ? inputs.map(i => `  * @param {string} input.${i} - ${i}`).join('\n')
    : '  * @param {object} input - Command input';

  return `/**
 * OS Task: ${name}
 * @description ${description || `System command task: ${name}`}
 * ${inputsDoc}
 * @returns {Promise<object>} Task result with stdout, stderr, code
 *
 * Example commands:
 *   - apt update && apt install -y curl
 *   - npm install express
 *   - systemctl status nginx
 *   - docker ps
 *   - df -h
 */
export async function ${funcName}(input) {
  const command = input.command || input.cmd || '${inputs.length > 0 ? `input.${inputs[0]}` : 'echo "No command provided"'}';

  if (!command) {
    throw new Error('No command provided in input. Pass command as input.command or first parameter');
  }

  let stdout = '';
  let stderr = '';
  let code = 0;

  try {
    stdout = execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: '/bin/bash'
    });
    code = 0;
  } catch (error) {
    stdout = error.stdout || '';
    stderr = error.stderr || error.message || '';
    code = error.status || 1;
  }

  const result = {
    success: code === 0,
    command,
    code,
    stdout: stdout.trim(),
    stderr: stderr.trim(),
    timestamp: new Date().toISOString(),
    input
  };

  return result;
}
`;
}
