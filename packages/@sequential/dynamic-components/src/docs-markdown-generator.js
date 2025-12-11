// Markdown documentation generator
export class DocsMarkdownGenerator {
  generateMarkdownDoc(pattern) {
    let doc = '';

    doc += `# ${pattern.name}\n\n`;

    if (pattern.description) {
      doc += `${pattern.description}\n\n`;
    }

    doc += `## Overview\n\n`;
    doc += `- **Category**: ${pattern.category}\n`;
    doc += `- **Code Reduction**: ${pattern.codeReduction} lines\n`;
    if (pattern.tags?.length > 0) {
      doc += `- **Tags**: ${pattern.tags.join(', ')}\n`;
    }
    doc += '\n';

    if (pattern.usage) {
      doc += `## Usage\n\n\`\`\`javascript\n${pattern.usage}\n\`\`\`\n\n`;
    }

    if (pattern.example) {
      doc += `## Example\n\n\`\`\`javascript\n${pattern.example}\n\`\`\`\n\n`;
    }

    if (Object.keys(pattern.properties || {}).length > 0) {
      doc += `## Properties\n\n`;
      doc += `| Property | Type | Description |\n`;
      doc += `|----------|------|-------------|\n`;

      Object.entries(pattern.properties).forEach(([prop, config]) => {
        doc += `| \`${prop}\` | \`${config.type || 'any'}\` | ${config.description || ''} |\n`;
      });
      doc += '\n';
    }

    if (pattern.dependencies?.length > 0) {
      doc += `## Dependencies\n\n`;
      pattern.dependencies.forEach(dep => {
        doc += `- ${dep}\n`;
      });
      doc += '\n';
    }

    if (pattern.accessibility?.length > 0) {
      doc += `## Accessibility\n\n`;
      pattern.accessibility.forEach(a11y => {
        doc += `- ${a11y}\n`;
      });
      doc += '\n';
    }

    if (Object.keys(pattern.performance || {}).length > 0) {
      doc += `## Performance\n\n`;
      Object.entries(pattern.performance).forEach(([metric, value]) => {
        doc += `- **${metric}**: ${value}\n`;
      });
      doc += '\n';
    }

    doc += `---\n\nGenerated on ${new Date().toISOString()}\n`;

    return doc;
  }

  generateLibraryMarkdown(patterns, categories) {
    let doc = '# Component Pattern Library\n\n';
    doc += `Generated on ${new Date().toISOString()}\n\n`;
    doc += `Total Patterns: ${patterns.size}\n\n`;

    doc += '## Table of Contents\n\n';
    categories.forEach(cat => {
      doc += `- [${cat}](#${cat.toLowerCase().replace(/\s+/g, '-')})\n`;
    });
    doc += '\n';

    categories.forEach(category => {
      doc += `## ${category}\n\n`;

      const patternIds = Array.from(patterns.entries())
        .filter(([, pattern]) => pattern.category === category)
        .map(([id]) => id);

      patternIds.forEach(patternId => {
        const pattern = patterns.get(patternId);
        if (pattern) {
          doc += `### ${pattern.name}\n\n`;
          doc += `${pattern.description}\n\n`;
          doc += `- **Code Reduction**: ${pattern.codeReduction} lines\n`;
          if (pattern.tags?.length > 0) {
            doc += `- **Tags**: ${pattern.tags.join(', ')}\n`;
          }
          doc += '\n';
        }
      });
    });

    return doc;
  }
}
