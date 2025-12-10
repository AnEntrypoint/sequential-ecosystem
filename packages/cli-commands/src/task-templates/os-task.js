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
 * @id ${taskId}
 * @created ${timestamp}
 * @inputs ${inputs.join(', ')}
 * @runner sequential-machine
 *
 * This task executes system/OS commands like apt, npm, shell scripts, etc.
 * Useful for: package management, system configuration, deployment, etc.
 */

export const config = {
  name: '${name}',
  description: '${description || `System command task: ${name}`}',
  id: '${taskId}',
  created: '${timestamp}',
  runner: 'sequential-machine',
  type: 'os',
  inputs: ${JSON.stringify(inputs.map(input => ({
    name: input,
    type: 'string',
    description: `Parameter: ${input}`
  })), null, 2).split('\n').map((line, i) => i === 0 ? line : '  ' + line).join('\n')}
};

/**
 * Main OS task implementation
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
  const { execSync } = await import('child_process');
  const fs = await import('fs');
  const logger = (await import('@sequentialos/sequential-logging')).default;

  // Build command from input - allow command as first param or named param
  const command = input.command || input.cmd || '${inputs.length > 0 ? `input.${inputs[0]}` : 'echo "No command provided"'}';

  if (!command) {
    throw new Error('No command provided in input. Pass command as input.command or first parameter');
  }

  logger.info(\`🔧 Executing OS command: \${command}\`);

  let stdout = '';
  let stderr = '';
  let code = 0;

  try {
    // Execute command with live output
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

    // For non-zero exit codes, log but don't throw - let caller decide
    logger.warn(\`⚠️  Command exited with code \${code}\`);
  }

  // Save results to file for inspection
  const resultFile = \`os-task-result-\${Date.now()}.json\`;
  const result = {
    success: code === 0,
    command,
    code,
    stdout: stdout.trim(),
    stderr: stderr.trim(),
    timestamp: new Date().toISOString(),
    input
  };

  fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));
  logger.info(\`✅ Result saved to: \${resultFile}\`);

  // Print output
  if (stdout) {
    logger.info('📤 STDOUT:');
    console.log(stdout);
  }
  if (stderr && code !== 0) {
    logger.info('📥 STDERR:');
    console.error(stderr);
  }

  return result;
}
`;
}
