import path from 'path';
import { randomUUID } from 'crypto';
import { writeFileAtomicString } from 'file-operations';
import logger from '@sequential/sequential-logging';
import { nowISO, createTimestamps, updateTimestamp } from '@sequential/timestamp-utilities';
import { delay, withRetry } from '@sequential/async-patterns';

export async function createSimpleFlowExample(tasksDir) {
  const taskName = 'example-simple-flow';
  const taskFile = path.join(tasksDir, `${taskName}.js`);
  const taskId = randomUUID();
  const timestamp = nowISO();

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

  logger.info(\`Processing message: \${message}\`);

  const response = await fetch('https://httpbin.org/delay/1');
  const data = await response.json();

  await new Promise(resolve => setTimeout(resolve, delay));

  const result = {
    success: true,
    processed: message.toUpperCase(),
    timestamp: nowISO(),
    httpbinData: data.url,
    input
  };

  logger.info(\`Completed: \${JSON.stringify(result)}\`);

  return result;
}
`;

  await writeFileAtomicString(taskFile, code);
  logger.info(`✓ Created ${taskName}`);
}
