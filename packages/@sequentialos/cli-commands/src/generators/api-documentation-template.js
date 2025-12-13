/**
 * API Documentation Template
 * Generates documentation template code
 */

export function generateDocumentationTemplate() {
  return `/**
 * API Documentation
 *
 * Auto-generate documentation for tasks, tools, and flows.
 */

import { generateTaskDocumentation, createDocumentationGenerator } from '@sequentialos/api-documentation';

const docGen = createDocumentationGenerator();

// Register task documentation
docGen.register('task', 'fetchUser', {
  name: 'Fetch User',
  description: 'Retrieve user data from the API',
  version: '1.0.0',
  inputs: [
    { name: 'userId', type: 'number', required: true, description: 'The user ID to fetch' },
    { name: 'includeOrders', type: 'boolean', required: false, description: 'Include order history' }
  ],
  output: {
    type: 'object',
    description: 'User object with profile information'
  },
  examples: [
    {
      name: 'Fetch user by ID',
      code: 'const user = await fetchUser({ userId: 123 });'
    }
  ],
  errors: [
    { code: 'NOT_FOUND', description: 'User not found' },
    { code: 'UNAUTHORIZED', description: 'Invalid credentials' }
  ],
  tags: ['api', 'users', 'data']
});

// Get documentation
export function getTaskDocs(taskName) {
  return docGen.getDocumentation('task', taskName);
}

// Generate markdown
export function getTaskMarkdown(taskName) {
  return docGen.generateMarkdown('task', taskName);
}

// Generate OpenAPI spec
export function getTaskOpenAPI(taskName) {
  return docGen.generateOpenAPI('task', taskName);
}

// List all documented resources
export function listAllDocumentation() {
  return docGen.listAll();
}

// Search documentation
export function searchDocumentation(query) {
  return docGen.search(query);
}
`;
}
