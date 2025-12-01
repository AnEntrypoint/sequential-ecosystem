import path from 'path';
import { randomUUID } from 'crypto';
import { writeFileAtomicString } from '@sequential/file-operations';

export async function createApiIntegrationExample(tasksDir) {
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

  await writeFileAtomicString(taskFile, code);
  console.log(`✓ Created ${taskName}`);
}
