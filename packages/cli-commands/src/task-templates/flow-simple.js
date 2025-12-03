import logger from '@sequential/sequential-logging';
import { nowISO, createTimestamps, updateTimestamp } from '@sequential/timestamp-utilities';
export function generateFlowSimpleTemplate(name, taskId, timestamp, inputs, description) {
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
  logger.info('Starting task:', '${name}');
  logger.info('Input:', JSON.stringify(input, null, 2));

  try {
    const startTime = Date.now();

    const response = await fetch('https://httpbin.org/json');

    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }

    const data = await response.json();

    const result = {
      success: true,
      input,
      data,
      duration: Date.now() - startTime,
      timestamp: nowISO()
    };

    logger.info('Task completed successfully');
    logger.info('Result:', JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    logger.error('Task failed:', error.message);

    return {
      success: false,
      error: error.message,
      input,
      timestamp: nowISO()
    };
  }
}
`;
}
