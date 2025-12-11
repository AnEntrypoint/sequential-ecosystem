/**
 * API Documentation Core - Factory and Generator Module
 * Documentation generator factory and format generators
 */

export function createDocumentationGenerator() {
  const docs = new Map();

  return {
    register(resourceType, resourceName, documentation) {
      const key = `${resourceType}:${resourceName}`;
      docs.set(key, documentation);
      return this;
    },

    getDocumentation(resourceType, resourceName) {
      return docs.get(`${resourceType}:${resourceName}`);
    },

    generateMarkdown(resourceType, resourceName) {
      const doc = this.getDocumentation(resourceType, resourceName);
      if (!doc) return null;

      let markdown = `# ${doc.name}\n\n`;
      markdown += `**Version:** ${doc.version}\n\n`;

      if (doc.description) {
        markdown += `## Description\n${doc.description}\n\n`;
      }

      if (doc.inputs && doc.inputs.length > 0) {
        markdown += `## Parameters\n\n`;
        markdown += `| Name | Type | Required | Description |\n`;
        markdown += `|------|------|----------|-------------|\n`;
        for (const input of doc.inputs) {
          markdown += `| ${input.name} | ${input.type} | ${input.required ? 'Yes' : 'No'} | ${input.description} |\n`;
        }
        markdown += `\n`;
      }

      if (doc.output) {
        markdown += `## Returns\n\n`;
        markdown += `**Type:** ${doc.output.type}\n\n`;
        markdown += `${doc.output.description}\n\n`;
      }

      if (doc.examples && doc.examples.length > 0) {
        markdown += `## Examples\n\n`;
        for (const example of doc.examples) {
          markdown += `\`\`\`javascript\n${example.code}\n\`\`\`\n\n`;
        }
      }

      if (doc.errors && doc.errors.length > 0) {
        markdown += `## Errors\n\n`;
        for (const error of doc.errors) {
          markdown += `- **${error.code}**: ${error.description}\n`;
        }
        markdown += `\n`;
      }

      return markdown;
    },

    generateOpenAPI(resourceType, resourceName) {
      const doc = this.getDocumentation(resourceType, resourceName);
      if (!doc) return null;

      const properties = {};
      for (const input of doc.inputs || []) {
        properties[input.name] = {
          type: input.type,
          description: input.description
        };
      }

      return {
        name: doc.name,
        description: doc.description,
        requestBody: {
          type: 'object',
          properties
        },
        responses: {
          '200': {
            description: 'Success',
            schema: {
              type: doc.output?.type || 'object'
            }
          }
        }
      };
    },

    listAll() {
      const all = [];
      for (const [key, doc] of docs.entries()) {
        all.push({ key, ...doc });
      }
      return all;
    },

    search(query) {
      const results = [];
      for (const [key, doc] of docs.entries()) {
        if (doc.name.includes(query) ||
            doc.description.includes(query) ||
            (doc.tags && doc.tags.join(',').includes(query))) {
          results.push({ key, ...doc });
        }
      }
      return results;
    }
  };
}

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
