export function generateFlowMinimalTemplate(name, taskId, timestamp, inputs, description) {
  const funcName = name.replace(/-/g, '_');
  const inputParams = inputs.length > 0
    ? inputs.map(i => `  ${i}: '?'`).join(',\n')
    : '  // Add input parameters here';

  return `/**
 * ${description || `Task: ${name}`}
 * @id ${taskId}
 */

export const config = {
  name: '${name}',
  description: '${description || `Task: ${name}`}'
};

export async function ${funcName}(input) {
  try {
    // TODO: Implement your logic here
    return { success: true, data: input };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
`;
}
