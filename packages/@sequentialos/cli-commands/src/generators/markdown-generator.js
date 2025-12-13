/**
 * markdown-generator.js
 *
 * Generate comprehensive markdown documentation from flow docs
 */

export function generateFlowMarkdown(doc) {
  if (!doc) return '';

  let markdown = `# ${doc.name}\n\n`;

  if (doc.purpose) {
    markdown += `**Purpose:** ${doc.purpose}\n\n`;
  }

  if (doc.description) {
    markdown += `${doc.description}\n\n`;
  }

  markdown += '## Flow Information\n\n';
  markdown += '| Property | Value |\n';
  markdown += '|----------|-------|\n';
  markdown += `| Version | ${doc.version} |\n`;
  markdown += `| Initial State | ${doc.initial} |\n`;
  markdown += `| State Count | ${Object.keys(doc.states).length} |\n`;
  markdown += `| Complexity | ${doc.complexity.complexity} |\n\n`;

  markdown += '## States\n\n';
  for (const [stateName, state] of Object.entries(doc.states)) {
    markdown += `### ${stateName} (${state.type})\n\n`;
    if (state.description) markdown += `${state.description}\n\n`;
    if (state.documentation) markdown += `${state.documentation}\n\n`;

    if (state.transitions.length > 0) {
      markdown += '**Transitions:**\n';
      for (const transition of state.transitions) {
        markdown += `- [${transition.event}] → ${transition.target} (${transition.condition})\n`;
      }
      markdown += '\n';
    }

    if (state.errorCodes.length > 0) {
      markdown += `**Error Codes:** ${state.errorCodes.join(', ')}\n\n`;
    }

    if (state.recoveryStrategy) {
      markdown += `**Recovery Strategy:** ${state.recoveryStrategy}\n\n`;
    }
  }

  markdown += '## Execution Paths\n\n';
  markdown += `**Happy Path:** ${doc.happyPath.join(' → ')}\n\n`;

  if (doc.errorPaths.length > 0) {
    markdown += '**Error Paths:**\n';
    for (const errorPath of doc.errorPaths) {
      markdown += `- ${errorPath.trigger} → ${errorPath.handler}\n`;
    }
    markdown += '\n';
  }

  return markdown;
}
