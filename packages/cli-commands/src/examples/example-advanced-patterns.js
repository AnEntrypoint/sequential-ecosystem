import path from 'path';
import { randomUUID } from 'crypto';
import { writeFileAtomicString } from '@sequentialos/file-operations';
import logger from '@sequentialos/sequential-logging';
import { nowISO } from '@sequentialos/timestamp-utilities';

export async function createAdvancedPatternExamples(tasksDir) {
  const examples = [
    {
      name: 'example-retry-pattern',
      description: 'Demonstrates retry with exponential backoff',
      code: `export const config = {
  name: 'example-retry-pattern',
  description: 'Task with automatic retry and backoff',
  runner: 'sequential-flow',
  inputs: [{ name: 'url', type: 'string', default: 'https://api.example.com/data' }]
};

async function fetchWithRetry(url, maxRetries = 3, delay = 1000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
      return await response.json();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const backoffDelay = delay * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, backoffDelay));
    }
  }
}

export async function main(input) {
  const { url } = input;
  try {
    const data = await fetchWithRetry(url);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
`
    },
    {
      name: 'example-error-boundary',
      description: 'Demonstrates error handling and recovery',
      code: `export const config = {
  name: 'example-error-boundary',
  description: 'Task with error handling and fallback strategy',
  runner: 'sequential-flow',
  inputs: [{ name: 'source', type: 'string', default: 'primary' }]
};

async function fetchFromSource(source) {
  const sources = {
    primary: 'https://api.example.com/primary',
    secondary: 'https://api.example.com/secondary',
    fallback: 'https://api.example.com/fallback'
  };

  const url = sources[source] || sources.primary;
  const response = await fetch(url);
  if (!response.ok) throw new Error(\`Source \${source} failed\`);
  return await response.json();
}

export async function main(input) {
  const { source } = input;
  const sourceOrder = ['primary', 'secondary', 'fallback'];

  for (const src of sourceOrder) {
    try {
      const data = await fetchFromSource(src);
      return {
        success: true,
        data,
        source: src,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (src === sourceOrder[sourceOrder.length - 1]) {
        return {
          success: false,
          error: 'All sources exhausted',
          lastError: error.message
        };
      }
    }
  }
}
`
    },
    {
      name: 'example-parallel-execution',
      description: 'Demonstrates parallel task execution',
      code: `export const config = {
  name: 'example-parallel-execution',
  description: 'Execute multiple operations in parallel',
  runner: 'sequential-flow',
  inputs: [
    { name: 'userIds', type: 'string', default: '1,2,3' }
  ]
};

async function fetchUser(userId) {
  const response = await fetch(\`https://api.example.com/users/\${userId}\`);
  if (!response.ok) throw new Error(\`User \${userId} not found\`);
  return await response.json();
}

export async function main(input) {
  const { userIds } = input;
  const ids = userIds.split(',').map(id => id.trim());

  try {
    const results = await Promise.all(
      ids.map(id => fetchUser(id))
    );

    return {
      success: true,
      count: results.length,
      users: results,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
`
    },
    {
      name: 'example-state-management',
      description: 'Demonstrates state tracking across steps',
      code: `export const config = {
  name: 'example-state-management',
  description: 'Track and manage state throughout execution',
  runner: 'sequential-flow',
  inputs: [
    { name: 'items', type: 'string', default: 'a,b,c' }
  ]
};

export async function main(input) {
  const { items } = input;
  const state = {
    processed: [],
    failed: [],
    startTime: new Date(),
    steps: []
  };

  const itemList = items.split(',').map(i => i.trim());

  for (const item of itemList) {
    state.steps.push({
      item,
      status: 'processing',
      timestamp: new Date().toISOString()
    });

    try {
      const result = await fetch(\`https://api.example.com/process?item=\${item}\`);
      state.processed.push(item);
      state.steps[state.steps.length - 1].status = 'completed';
    } catch (error) {
      state.failed.push(item);
      state.steps[state.steps.length - 1].status = 'failed';
    }
  }

  return {
    success: state.failed.length === 0,
    state: {
      processedCount: state.processed.length,
      failedCount: state.failed.length,
      duration: new Date() - state.startTime,
      items: state.processed,
      failed: state.failed,
      steps: state.steps
    }
  };
}
`
    }
  ];

  for (const example of examples) {
    const taskFile = path.join(tasksDir, example.name, 'code.js');
    const configFile = path.join(tasksDir, example.name, 'config.json');

    await writeFileAtomicString(taskFile, example.code);
    logger.info(`  ✓ Created ${example.name}/code.js`);

    const config = {
      id: randomUUID(),
      name: example.name,
      description: example.description,
      runner: 'sequential-flow',
      created: nowISO()
    };
    await writeFileAtomicString(configFile, JSON.stringify(config, null, 2));
  }
}
