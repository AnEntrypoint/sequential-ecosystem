import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export async function createExamples() {
  const tasksDir = path.join(process.cwd(), 'tasks');
  fs.mkdirSync(tasksDir, { recursive: true });

  const examples = [
    createSimpleFlowExample,
    createComplexFlowExample,
    createApiIntegrationExample,
    createBatchProcessingExample
  ];

  for (const createExample of examples) {
    await createExample(tasksDir);
  }

  createExamplesReadme(tasksDir);
}

function createSimpleFlowExample(tasksDir) {
  const taskName = 'example-simple-flow';
  const taskFile = path.join(tasksDir, `${taskName}.js`);
  const taskId = randomUUID();
  const timestamp = new Date().toISOString();

  const code = `export const config = {
  name: '${taskName}',
  description: 'Simple flow task demonstrating basic async operations with fetch()',
  id: '${taskId}',
  created: '${timestamp}',
  runner: 'sequential-flow',
  inputs: [
    {
      name: 'message',
      type: 'string',
      description: 'Message to process',
      default: 'hello'
    },
    {
      name: 'delay',
      type: 'number',
      description: 'Delay in milliseconds',
      default: 1000
    }
  ]
};

export async function example_simple_flow(input) {
  const { message = 'hello', delay = 1000 } = input;

  console.log(\`Processing message: \${message}\`);

  const response = await fetch('https://httpbin.org/delay/1');
  const data = await response.json();

  await new Promise(resolve => setTimeout(resolve, delay));

  const result = {
    success: true,
    processed: message.toUpperCase(),
    timestamp: new Date().toISOString(),
    httpbinData: data.url,
    input
  };

  console.log(\`Completed: \${JSON.stringify(result)}\`);

  return result;
}
`;

  fs.writeFileSync(taskFile, code);
  console.log(`✓ Created ${taskName}`);
}

function createComplexFlowExample(tasksDir) {
  const taskName = 'example-complex-flow';
  const taskFile = path.join(tasksDir, `${taskName}.js`);
  const taskId = randomUUID();
  const timestamp = new Date().toISOString();

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

  console.log(\`Initializing with \${items.length} items\`);

  return {
    items,
    maxRetries,
    retryCount: 0,
    processedItems: [],
    startTime: new Date().toISOString()
  };
}

export async function fetchData(result, context = {}) {
  console.log('Fetching external data...');

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

  console.log(\`Retry attempt \${retryCount}/\${result.maxRetries}\`);

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

  console.log(\`Processing \${items.length} items\`);

  const processedItems = items.map((item, index) => ({
    id: index,
    original: item,
    processed: \`[\${item.toUpperCase()}]\`,
    timestamp: new Date().toISOString()
  }));

  return {
    ...result,
    processedItems,
    completedAt: new Date().toISOString(),
    success: true
  };
}

export async function handleError(error, context = {}) {
  console.error('Task failed:', error.message);

  return {
    success: false,
    error: error.message,
    stack: error.stack,
    context,
    failedAt: new Date().toISOString()
  };
}
`;

  fs.writeFileSync(taskFile, code);
  console.log(`✓ Created ${taskName}`);
}

function createApiIntegrationExample(tasksDir) {
  const taskName = 'example-api-integration';
  const taskFile = path.join(tasksDir, `${taskName}.js`);
  const taskId = randomUUID();
  const timestamp = new Date().toISOString();

  const code = `export const config = {
  name: '${taskName}',
  description: 'Demonstrates API integration patterns with service wrappers',
  id: '${taskId}',
  created: '${timestamp}',
  runner: 'sequential-flow',
  inputs: [
    {
      name: 'endpoint',
      type: 'string',
      description: 'API endpoint to call',
      default: 'https://httpbin.org/get'
    },
    {
      name: 'method',
      type: 'string',
      description: 'HTTP method',
      default: 'GET'
    },
    {
      name: 'params',
      type: 'object',
      description: 'Query parameters',
      default: {}
    }
  ]
};

export async function example_api_integration(input) {
  const { endpoint = 'https://httpbin.org/get', method = 'GET', params = {} } = input;

  console.log(\`Calling API: \${method} \${endpoint}\`);

  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? \`\${endpoint}?\${queryString}\` : endpoint;

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'sequential-ecosystem/1.0'
    }
  };

  let response;
  let retries = 3;
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      console.log(\`Attempt \${i + 1}/\${retries}\`);
      response = await fetch(url, options);

      if (response.ok) {
        break;
      }

      if (response.status >= 500) {
        lastError = new Error(\`Server error: \${response.status}\`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }

      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    } catch (error) {
      lastError = error;
      if (i === retries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  const data = await response.json();

  const result = {
    success: true,
    endpoint,
    method,
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    data,
    timestamp: new Date().toISOString()
  };

  console.log('API call successful');

  return result;
}
`;

  fs.writeFileSync(taskFile, code);
  console.log(`✓ Created ${taskName}`);
}

function createBatchProcessingExample(tasksDir) {
  const taskName = 'example-batch-processing';
  const taskFile = path.join(tasksDir, `${taskName}.js`);
  const taskId = randomUUID();
  const timestamp = new Date().toISOString();

  const code = `export const config = {
  name: '${taskName}',
  description: 'Batch processing with concurrency control and progress tracking',
  id: '${taskId}',
  created: '${timestamp}',
  runner: 'sequential-flow',
  inputs: [
    {
      name: 'items',
      type: 'array',
      description: 'Items to process in batches',
      default: Array.from({ length: 10 }, (_, i) => \`item-\${i + 1}\`)
    },
    {
      name: 'batchSize',
      type: 'number',
      description: 'Items per batch',
      default: 3
    },
    {
      name: 'concurrency',
      type: 'number',
      description: 'Concurrent operations',
      default: 2
    }
  ]
};

async function processBatch(batch, batchIndex) {
  console.log(\`Processing batch \${batchIndex + 1} with \${batch.length} items\`);

  const results = await Promise.all(
    batch.map(async (item, index) => {
      const response = await fetch(\`https://httpbin.org/delay/0\`);
      const data = await response.json();

      return {
        item,
        batchIndex,
        itemIndex: index,
        processed: item.toUpperCase(),
        timestamp: new Date().toISOString(),
        url: data.url
      };
    })
  );

  return results;
}

async function processWithConcurrency(batches, concurrency) {
  const results = [];
  const executing = [];

  for (const [index, batch] of batches.entries()) {
    const promise = processBatch(batch, index).then(result => {
      executing.splice(executing.indexOf(promise), 1);
      return result;
    });

    results.push(promise);
    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

export async function example_batch_processing(input) {
  const {
    items = Array.from({ length: 10 }, (_, i) => \`item-\${i + 1}\`),
    batchSize = 3,
    concurrency = 2
  } = input;

  console.log(\`Processing \${items.length} items in batches of \${batchSize} with concurrency \${concurrency}\`);

  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  console.log(\`Created \${batches.length} batches\`);

  const startTime = Date.now();
  const batchResults = await processWithConcurrency(batches, concurrency);
  const endTime = Date.now();

  const allResults = batchResults.flat();

  const result = {
    success: true,
    totalItems: items.length,
    batchSize,
    concurrency,
    totalBatches: batches.length,
    processedItems: allResults.length,
    duration: endTime - startTime,
    averageTimePerItem: (endTime - startTime) / allResults.length,
    results: allResults,
    timestamp: new Date().toISOString()
  };

  console.log(\`Completed \${allResults.length} items in \${result.duration}ms\`);

  return result;
}
`;

  fs.writeFileSync(taskFile, code);
  console.log(`✓ Created ${taskName}`);
}

function createExamplesReadme(tasksDir) {
  const readmeFile = path.join(tasksDir, 'EXAMPLES.md');

  const content = `# Sequential Ecosystem Examples

Comprehensive examples demonstrating all features and patterns.

## Examples Overview

### 1. Simple Flow (\`example-simple-flow\`)

Basic async operations with automatic pause/resume on \`fetch()\`.

**Features:**
- Auto-pause on HTTP calls
- Simple async/await patterns
- Basic input validation
- Response transformation

**Run:**
\`\`\`bash
npx sequential-ecosystem run example-simple-flow --input '{"message":"hello","delay":1000}'
\`\`\`

### 2. Complex Flow (\`example-complex-flow\`)

State machine with explicit state transitions, error handling, and retry logic.

**Features:**
- Explicit state graph definition
- Multi-state workflow
- Error recovery strategies
- Retry logic with backoff
- State context passing

**Graph States:**
- \`initialize\` → \`fetchData\` → \`processItems\` → \`complete\`
- Error path: \`retryFetch\` → \`handleError\`

**Run:**
\`\`\`bash
npx sequential-ecosystem run example-complex-flow --input '{"items":["a","b","c"],"maxRetries":3}'
\`\`\`

### 3. API Integration (\`example-api-integration\`)

Patterns for integrating external APIs with retry, error handling, and header management.

**Features:**
- HTTP client patterns
- Retry logic with exponential backoff
- Error classification (4xx vs 5xx)
- Header management
- Query parameter handling

**Run:**
\`\`\`bash
npx sequential-ecosystem run example-api-integration --input '{"endpoint":"https://httpbin.org/get","method":"GET","params":{"key":"value"}}'
\`\`\`

### 4. Batch Processing (\`example-batch-processing\`)

Process large datasets with controlled concurrency and progress tracking.

**Features:**
- Batch creation from arrays
- Concurrency control
- Progress tracking
- Performance metrics
- Parallel execution within batches

**Run:**
\`\`\`bash
npx sequential-ecosystem run example-batch-processing --input '{"items":["a","b","c","d","e"],"batchSize":2,"concurrency":2}'
\`\`\`

## Patterns Demonstrated

### Implicit xstate (fetch-based)
Simple flow and API integration examples use \`fetch()\` which automatically triggers state saving.

### Explicit xstate (state graph)
Complex flow example defines explicit state machine with transitions.

### Error Handling
All examples include comprehensive error handling:
- Try/catch blocks
- Retry logic
- Error context preservation
- Graceful degradation

### Retry Strategies
- Fixed retry count
- Exponential backoff
- Conditional retry (5xx only)

### Concurrency Control
Batch processing shows how to limit concurrent operations.

## Creating Custom Tasks

Use these examples as templates:

\`\`\`bash
npx sequential-ecosystem create-task my-task
npx sequential-ecosystem create-task my-workflow --with-graph
npx sequential-ecosystem create-task my-machine --runner machine
\`\`\`

## Best Practices

1. **Use fetch() for HTTP calls** - Automatic state management
2. **Define explicit graphs for complex workflows** - Better control flow
3. **Always handle errors** - Include retry logic and fallbacks
4. **Track progress** - Log state transitions and operations
5. **Validate inputs** - Use config.inputs schema
6. **Return structured results** - Include success, timestamp, and data

## Testing Examples

\`\`\`bash
npx sequential-ecosystem list
npx sequential-ecosystem describe example-simple-flow
npx sequential-ecosystem run example-simple-flow --dry-run
npx sequential-ecosystem run example-simple-flow --input '{}' --save
npx sequential-ecosystem history example-simple-flow
\`\`\`

## Next Steps

1. Run all examples
2. Modify examples to fit your use case
3. Create custom tasks using patterns from examples
4. Deploy with appropriate storage adapter (folder/sqlite/supabase)

## Storage Adapters

Examples work with all storage backends:

\`\`\`bash
export DATABASE_URL="sqlite:./workflow.db"
npx sequential-ecosystem run example-simple-flow --input '{}'
\`\`\`

See \`CLAUDE.md\` for detailed architecture documentation.
`;

  fs.writeFileSync(readmeFile, content);
  console.log(`✓ Created EXAMPLES.md`);
}
