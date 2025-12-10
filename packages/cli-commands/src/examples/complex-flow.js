import path from 'path';
import { createCLICommand } from '@sequential/cli-handler';
import { randomUUID } from 'crypto';
import { writeFileAtomicString } from 'file-operations';
import logger from '@sequential/sequential-logging';
import { nowISO, createTimestamps, updateTimestamp } from '@sequential/timestamp-utilities';
import { delay, withRetry } from '@sequential/async-patterns';

export async function createComplexFlowExample(tasksDir) {
  const taskName = 'example-complex-flow';
  const taskFile = path.join(tasksDir, `${taskName}.js`);
  const taskId = randomUUID();
  const timestamp = nowISO();

  const code = `export const config = {
  name: '${taskName}',
  description: 'Complex flow with state graph, error handling, and retry logic',
  id: '${taskId}',
  created: '${timestamp}',
  runner: 'sequential-flow',
  inputs: [
    {
      name: 'items',
      type: 'array',
      description: 'Items to process',
      default: ['item1', 'item2', 'item3']
    },
    {
      name: 'maxRetries',
      type: 'number',
      description: 'Maximum retry attempts',
      default: 3
    }
  ]
};

export const graph = {
  id: '${taskName}',
  initial: 'initialize',
  states: {
    initialize: {
      description: 'Initialize processing',
      onDone: 'fetchData',
      onError: 'handleError'
    },
    fetchData: {
      description: 'Fetch external data',
      onDone: 'processItems',
      onError: 'retryFetch'
    },
    retryFetch: {
      description: 'Retry failed fetch',
      onDone: 'processItems',
      onError: 'handleError'
    },
    processItems: {
      description: 'Process all items',
      onDone: 'complete',
      onError: 'handleError'
    },
    handleError: {
      type: 'final',
      description: 'Error handling'
    },
    complete: {
      type: 'final',
      description: 'Task completed'
    }
  }
};

export async function initialize(input, context = {}) {
  const { items = [], maxRetries = 3 } = input;

  logger.info(\`Initializing with \${items.length} items\`);

  return {
    items,
    maxRetries,
    retryCount: 0,
    processedItems: [],
    startTime: nowISO()
  };
}

export async function fetchData(result, context = {}) {
  logger.info('Fetching external data...');

  try {
    const response = await fetch('https://httpbin.org/json');
    const data = await response.json();

    return {
      ...result,
      externalData: data
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
    const data = await response.json();

    return {
      ...result,
      retryCount,
      externalData: data,
      recovered: true
    };
  } catch (error) {
    throw new Error(\`Retry \${retryCount} failed: \${error.message}\`);
  }
}

export async function processItems(result, context = {}) {
  const { items = [], externalData } = result;

  logger.info(\`Processing \${items.length} items\`);

  const processedItems = items.map((item, index) => ({
    id: index,
    original: item,
    processed: \`[\${item.toUpperCase()}]\`,
    timestamp: nowISO()
  }));

  return {
    ...result,
    processedItems,
    completedAt: nowISO(),
    success: true
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

  await writeFileAtomicString(taskFile, code);
  logger.info(`✓ Created ${taskName}`);
}
