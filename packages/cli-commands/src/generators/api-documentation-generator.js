/**
 * API Documentation Generator
 * Factory for creating documentation generators with registration and formatting
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
