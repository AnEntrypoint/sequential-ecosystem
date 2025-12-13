// Code generation for templates
export class TemplateGenerator {
  constructor(advancedBuilder) {
    this.builder = advancedBuilder;
  }

  generateCode(template) {
    if (!template || !template.definition) return '';

    const def = template.definition;
    let code = `// Template: ${template.name}\n`;
    code += `// Category: ${template.category}\n`;
    code += `// Author: ${template.metadata?.author || 'unknown'}\n\n`;

    if (typeof def === 'function') {
      code += def.toString();
    } else if (typeof def === 'string') {
      code += def;
    } else if (typeof def === 'object') {
      code += `const definition = ${JSON.stringify(def, null, 2)};`;
    }

    return code;
  }

  generateJSX(template) {
    if (!this.builder) return '';
    return this.builder.generateComponentFromTemplate(template);
  }

  generateDocumentation(template) {
    return `# ${template.name}

**Category:** ${template.category}
**Author:** ${template.metadata?.author || 'system'}
**Code Reduction:** ${template.metadata?.codeReduction || 'N/A'}

## Description
${template.metadata?.description || 'No description available'}

## Tags
${template.metadata?.tags?.join(', ') || 'No tags'}

## Usage
\`\`\`javascript
// Template definition and usage
\`\`\``;
  }
}
