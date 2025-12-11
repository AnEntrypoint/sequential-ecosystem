/**
 * diagram-builder.js
 *
 * Generate ASCII flow diagrams from flow documentation
 */

export function generateFlowDiagram(doc) {
  if (!doc) return '';

  let diagram = `# Flow: ${doc.name}\n\n`;
  diagram += `**Purpose:** ${doc.purpose}\n\n`;
  diagram += `**Description:** ${doc.description}\n\n`;

  diagram += `## States\n\n`;
  for (const [stateName, state] of Object.entries(doc.states)) {
    diagram += `### ${stateName}\n`;
    diagram += `- **Type:** ${state.type}\n`;
    if (state.description) diagram += `- **Description:** ${state.description}\n`;
    if (state.documentation) diagram += `- **Details:** ${state.documentation}\n`;
    if (state.errorCodes.length > 0) {
      diagram += `- **Error Codes:** ${state.errorCodes.join(', ')}\n`;
    }
    if (state.recoveryStrategy) {
      diagram += `- **Recovery:** ${state.recoveryStrategy}\n`;
    }
    diagram += '\n';
  }

  diagram += `## Transitions\n\n`;
  for (const [stateName, state] of Object.entries(doc.states)) {
    for (const transition of state.transitions) {
      diagram += `- ${stateName} --[${transition.event}]--> ${transition.target}\n`;
    }
  }

  diagram += `\n## Happy Path\n\n`;
  diagram += doc.happyPath.join(' → ') + '\n\n';

  if (doc.errorPaths.length > 0) {
    diagram += `## Error Paths\n\n`;
    for (const errorPath of doc.errorPaths) {
      diagram += `- **${errorPath.trigger}:** ${errorPath.handler}\n`;
    }
  }

  return diagram;
}
