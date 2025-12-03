import logger from '@sequential/sequential-logging';
import { nowISO, createTimestamps, updateTimestamp } from '@sequential/timestamp-utilities';
import { delay, withRetry } from '@sequential/async-patterns';
export function generateFlowGraphTemplate(name, taskId, timestamp, inputs, description) {
  return `/**
 * Task: ${name}
 * @description ${description || `Task: ${name}`}
 * @id ${taskId}
 * @created ${timestamp}
 * @inputs ${inputs.join(', ')}
 * @runner sequential-flow
 *
 * State machine: ${name}
 * Initial state: initialize
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
  initial: 'initialize',
  states: {
    initialize: {
      description: 'Initialize task execution',
      onDone: 'fetchData',
      onError: 'handleError'
    },
    fetchData: {
      description: 'Fetch external data',
      onDone: 'processData',
      onError: 'retryFetch'
    },
    retryFetch: {
      description: 'Retry failed fetch',
      onDone: 'processData',
      onError: 'handleError'
    },
    processData: {
      description: 'Process fetched data',
      onDone: 'complete',
      onError: 'handleError'
    },
    handleError: {
      type: 'final',
      description: 'Error handling state'
    },
    complete: {
      type: 'final',
      description: 'Task completed successfully'
    }
  }
};

export async function initialize(input, context = {}) {
  logger.info('Initializing task:', '${name}');
  logger.info('Input:', JSON.stringify(input, null, 2));

  return {
    ...input,
    startTime: nowISO(),
    retryCount: 0,
    maxRetries: 3
  };
}

export async function fetchData(result, context = {}) {
  logger.info('Fetching data...');

  try {
    const response = await fetch('https://httpbin.org/json');

    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }

    const data = await response.json();

    return {
      ...result,
      externalData: data,
      fetchedAt: nowISO()
    };
  } catch (error) {
    if (result.retryCount < result.maxRetries) {
      throw new Error(\`Fetch failed, will retry: \${error.message}\`);
    }
    throw error;
  }
}

export async function retryFetch(error, context = {}) {
  const result = context.lastResult || {};
  const retryCount = (result.retryCount || 0) + 1;

  logger.info(\`Retry attempt \${retryCount}/\${result.maxRetries}\`);

  await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));

  try {
    const response = await fetch('https://httpbin.org/json');

    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }

    const data = await response.json();

    return {
      ...result,
      retryCount,
      externalData: data,
      fetchedAt: nowISO(),
      recovered: true
    };
  } catch (error) {
    throw new Error(\`Retry \${retryCount} failed: \${error.message}\`);
  }
}

export async function processData(result, context = {}) {
  logger.info('Processing data...');

  const { externalData } = result;

  const processedData = {
    ...externalData,
    processed: true,
    processedAt: nowISO()
  };

  return {
    success: true,
    input: result,
    data: processedData,
    completedAt: nowISO()
  };
}

export async function handleError(error, context = {}) {
  logger.error('Task failed:', error.message);

  return {
    success: false,
    error: error.message,
    stack: error.stack,
    context,
    failedAt: nowISO()
  };
}
`;
}
