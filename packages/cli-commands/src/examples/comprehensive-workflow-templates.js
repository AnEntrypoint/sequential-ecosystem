/**
 * Comprehensive Workflow Example Templates
 * Templates demonstrating task/tool composition and helper tasks
 */

export const COMPREHENSIVE_WORKFLOW_TEMPLATES = [
  {
    name: 'example-task-calls-tool',
    description: 'Task that calls a tool to query database',
    code: 'export const config = {\n  name: \'example-task-calls-tool\',\n  description: \'Demonstrates task calling tools\',\n  runner: \'sequential-flow\',\n  inputs: [{ name: \'userId\', type: \'string\', default: \'123\' }]\n};\n\nexport async function main(input) {\n  const { userId } = input;\n\n  // Task calls tool: Use __callHostTool__ to invoke registered tools\n  const user = await __callHostTool__(\'database\', \'query\', {\n    sql: \'SELECT * FROM users WHERE id = ?\',\n    params: [userId]\n  });\n\n  // Process result\n  const result = {\n    success: true,\n    user,\n    timestamp: new Date().toISOString()\n  };\n\n  return result;\n}'
  },
  {
    name: 'example-task-calls-task',
    description: 'Task that calls another task',
    code: 'export const config = {\n  name: \'example-task-calls-task\',\n  description: \'Demonstrates task calling other tasks\',\n  runner: \'sequential-flow\',\n  inputs: [{ name: \'email\', type: \'string\', default: \'user@example.com\' }]\n};\n\nexport async function main(input) {\n  const { email } = input;\n\n  // Step 1: Validate email format\n  const validateResult = await __callHostTool__(\'task\', \'example-validate-input\', {\n    email,\n    field: \'email\'\n  });\n\n  if (!validateResult.success) {\n    throw new Error(`Validation failed: ${validateResult.error}`);\n  }\n\n  // Step 2: Check if email already exists (calls another task)\n  const existsResult = await __callHostTool__(\'task\', \'example-check-existing\', {\n    email\n  });\n\n  if (existsResult.exists) {\n    throw new Error(\'Email already registered\');\n  }\n\n  // Step 3: Fetch user profile from API (calls another task)\n  const profileResult = await __callHostTool__(\'task\', \'example-fetch-profile\', {\n    email\n  });\n\n  return {\n    success: true,\n    validated: validateResult.result,\n    available: !existsResult.exists,\n    profile: profileResult.data\n  };\n}'
  },
  {
    name: 'example-validate-input',
    description: 'Helper task for validating inputs',
    code: 'export const config = {\n  name: \'example-validate-input\',\n  description: \'Validates input fields\',\n  runner: \'sequential-flow\',\n  inputs: [\n    { name: \'field\', type: \'string\' },\n    { name: \'email\', type: \'string\' }\n  ]\n};\n\nexport async function main(input) {\n  const { field, email } = input;\n\n  const isValid = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);\n\n  return {\n    success: isValid,\n    error: isValid ? null : `Invalid ${field}: ${email}`,\n    result: { [field]: email, valid: isValid }\n  };\n}'
  },
  {
    name: 'example-check-existing',
    description: 'Helper task for checking if email exists',
    code: 'export const config = {\n  name: \'example-check-existing\',\n  description: \'Checks if email already exists\',\n  runner: \'sequential-flow\',\n  inputs: [{ name: \'email\', type: \'string\' }]\n};\n\nexport async function main(input) {\n  const { email } = input;\n\n  // In real app, would call database tool\n  // Simulating: even numbered emails don\'t exist\n  const emailNumber = email.charCodeAt(0);\n  const exists = emailNumber % 2 === 0;\n\n  return {\n    exists,\n    email,\n    checkedAt: new Date().toISOString()\n  };\n}'
  },
  {
    name: 'example-fetch-profile',
    description: 'Helper task for fetching user profile',
    code: 'export const config = {\n  name: \'example-fetch-profile\',\n  description: \'Fetches user profile from external API\',\n  runner: \'sequential-flow\',\n  inputs: [{ name: \'email\', type: \'string\' }]\n};\n\nexport async function main(input) {\n  const { email } = input;\n\n  // This is where auto-pause happens - fetch() pauses execution\n  try {\n    const response = await fetch(\'https://api.example.com/profile?email=\' + encodeURIComponent(email));\n    const data = await response.json();\n\n    return {\n      success: true,\n      data,\n      fetchedAt: new Date().toISOString()\n    };\n  } catch (error) {\n    // If API is down, return mock data\n    return {\n      success: false,\n      data: {\n        email,\n        name: \'Mock User\',\n        createdAt: new Date().toISOString()\n      },\n      error: error.message\n    };\n  }\n}'
  }
];
