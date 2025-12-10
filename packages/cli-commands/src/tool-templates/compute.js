import logger from '@sequentialos/sequential-logging';

export function generateComputeToolTemplate(name, toolId, timestamp, description, category) {
  const funcName = name.replace(/-/g, '_');

  return `/**
 * Tool: ${name}
 * @description ${description || `Compute tool: ${name}`}
 * @category ${category}
 * @id ${toolId}
 * @created ${timestamp}
 * @template compute
 */

export const config = {
  id: '${toolId}',
  name: '${name}',
  description: '${description || `Compute tool: ${name}`}',
  category: '${category}',
  created: '${timestamp}',
  parameters: {
    input: {
      type: 'any',
      description: 'Input data to process'
    }
  }
};

/**
 * Process and transform data
 * @param {*} input - Input data to process
 * @returns {Promise<*>} Processed result
 */
export async function ${funcName}(input) {
  try {
    logger.info('Processing input:', JSON.stringify(input, null, 2));

    // TODO: Add your computation logic here
    // Example patterns:
    // - Data transformation: Convert format A to format B
    // - Calculation: Aggregate, summarize, or compute values
    // - Text processing: Parse, extract, or generate text
    // - ML inference: Call model and process predictions

    const result = {
      success: true,
      input,
      output: input,
      processedAt: new Date().toISOString()
    };

    logger.info('Processing complete');
    return result;

  } catch (error) {
    logger.error(\`Computation failed: \${error.message}\`);
    throw {
      success: false,
      error: error.message,
      input
    };
  }
}
`;
}
