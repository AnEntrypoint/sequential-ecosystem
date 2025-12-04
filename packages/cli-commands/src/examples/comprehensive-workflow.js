import path from 'path';
import { randomUUID } from 'crypto';
import { writeFileAtomicString } from '@sequential/file-operations';
import logger from '@sequential/sequential-logging';
import { nowISO } from '@sequential/timestamp-utilities';

export async function createComprehensiveWorkflowExample(tasksDir) {
  const examples = [
    {
      name: 'example-task-calls-tool',
      description: 'Task that calls a tool to query database',
      code: `export const config = {
  name: 'example-task-calls-tool',
  description: 'Demonstrates task calling tools',
  runner: 'sequential-flow',
  inputs: [{ name: 'userId', type: 'string', default: '123' }]
};

export async function main(input) {
  const { userId } = input;

  // Task calls tool: Use __callHostTool__ to invoke registered tools
  const user = await __callHostTool__('database', 'query', {
    sql: 'SELECT * FROM users WHERE id = ?',
    params: [userId]
  });

  // Process result
  const result = {
    success: true,
    user,
    timestamp: new Date().toISOString()
  };

  return result;
}
`
    },
    {
      name: 'example-task-calls-task',
      description: 'Task that calls another task',
      code: `export const config = {
  name: 'example-task-calls-task',
  description: 'Demonstrates task calling other tasks',
  runner: 'sequential-flow',
  inputs: [{ name: 'email', type: 'string', default: 'user@example.com' }]
};

export async function main(input) {
  const { email } = input;

  // Step 1: Validate email format
  const validateResult = await __callHostTool__('task', 'example-validate-input', {
    email,
    field: 'email'
  });

  if (!validateResult.success) {
    throw new Error(\`Validation failed: \${validateResult.error}\`);
  }

  // Step 2: Check if email already exists (calls another task)
  const existsResult = await __callHostTool__('task', 'example-check-existing', {
    email
  });

  if (existsResult.exists) {
    throw new Error('Email already registered');
  }

  // Step 3: Fetch user profile from API (calls another task)
  const profileResult = await __callHostTool__('task', 'example-fetch-profile', {
    email
  });

  return {
    success: true,
    validated: validateResult.result,
    available: !existsResult.exists,
    profile: profileResult.data
  };
}
`
    },
    {
      name: 'example-validate-input',
      description: 'Helper task for validating inputs',
      code: `export const config = {
  name: 'example-validate-input',
  description: 'Validates input fields',
  runner: 'sequential-flow',
  inputs: [
    { name: 'field', type: 'string' },
    { name: 'email', type: 'string' }
  ]
};

export async function main(input) {
  const { field, email } = input;

  const isValid = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);

  return {
    success: isValid,
    error: isValid ? null : \`Invalid \${field}: \${email}\`,
    result: { [field]: email, valid: isValid }
  };
}
`
    },
    {
      name: 'example-check-existing',
      description: 'Helper task for checking if email exists',
      code: `export const config = {
  name: 'example-check-existing',
  description: 'Checks if email already exists',
  runner: 'sequential-flow',
  inputs: [{ name: 'email', type: 'string' }]
};

export async function main(input) {
  const { email } = input;

  // In real app, would call database tool
  // Simulating: even numbered emails don't exist
  const emailNumber = email.charCodeAt(0);
  const exists = emailNumber % 2 === 0;

  return {
    exists,
    email,
    checkedAt: new Date().toISOString()
  };
}
`
    },
    {
      name: 'example-fetch-profile',
      description: 'Helper task for fetching user profile',
      code: `export const config = {
  name: 'example-fetch-profile',
  description: 'Fetches user profile from external API',
  runner: 'sequential-flow',
  inputs: [{ name: 'email', type: 'string' }]
};

export async function main(input) {
  const { email } = input;

  // This is where auto-pause happens - fetch() pauses execution
  try {
    const response = await fetch('https://api.example.com/profile?email=' + encodeURIComponent(email));
    const data = await response.json();

    return {
      success: true,
      data,
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    // If API is down, return mock data
    return {
      success: false,
      data: {
        email,
        name: 'Mock User',
        createdAt: new Date().toISOString()
      },
      error: error.message
    };
  }
}
`
    }
  ];

  for (const example of examples) {
    const taskFile = path.join(tasksDir, example.name, 'code.js');
    const configFile = path.join(tasksDir, example.name, 'config.json');
    const runsDir = path.join(tasksDir, example.name, 'runs');

    // Create task code file
    await writeFileAtomicString(taskFile, example.code);
    logger.info(`  ✓ Created ${example.name}/code.js`);

    // Create config file
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
