/**
 * Documentation Markdown Formatter
 * Generates markdown documentation from documentation objects
 */

export function createMarkdownFormatter() {
  return {
    format(doc) {
      if (!doc) return null;

      let markdown = `# ${doc.name}\n\n`;
      markdown += `**Version:** ${doc.version}\n\n`;

      if (doc.description) {
        markdown += `## Description\n${doc.description}\n\n`;
      }

      if (doc.inputs && doc.inputs.length > 0) {
        markdown += '## Parameters\n\n';
        markdown += '| Name | Type | Required | Description |\n';
        markdown += '|------|------|----------|-------------|\n';
        for (const input of doc.inputs) {
          markdown += `| ${input.name} | ${input.type} | ${input.required ? 'Yes' : 'No'} | ${input.description} |\n`;
        }
        markdown += '\n';
      }

      if (doc.output) {
        markdown += '## Returns\n\n';
        markdown += `**Type:** ${doc.output.type}\n\n`;
        markdown += `${doc.output.description}\n\n`;
      }

      if (doc.examples && doc.examples.length > 0) {
        markdown += '## Examples\n\n';
        for (const example of doc.examples) {
          markdown += `\`\`\`javascript\n${example.code}\n\`\`\`\n\n`;
        }
      }

      if (doc.errors && doc.errors.length > 0) {
        markdown += '## Errors\n\n';
        for (const error of doc.errors) {
          markdown += `- **${error.code}**: ${error.description}\n`;
        }
        markdown += '\n';
      }

      return markdown;
    }
  };
}
