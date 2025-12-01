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
  console.log('Starting task:', '${name}');
  console.log('Input:', JSON.stringify(input, null, 2));

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
      timestamp: new Date().toISOString()
    };

    console.log('Task completed successfully');
    console.log('Result:', JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error('Task failed:', error.message);

    return {
      success: false,
      error: error.message,
      input,
      timestamp: new Date().toISOString()
    };
  }
}
`;
}
