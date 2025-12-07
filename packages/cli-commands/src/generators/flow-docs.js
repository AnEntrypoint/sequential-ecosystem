export function createFlowDocumenter() {
  const flowDocs = new Map();

  return {
    documentFlow(flowName, graph, metadata = {}) {
      const states = {};

      for (const [stateName, stateConfig] of Object.entries(graph.states || {})) {
        const stateMetadata = metadata.states?.[stateName] || {};

        states[stateName] = {
          name: stateName,
          type: stateConfig.type || 'task',
          description: stateMetadata.description || '',
          transitions: this.extractTransitions(stateConfig),
          errorCodes: stateMetadata.errorCodes || [],
          recoveryStrategy: stateMetadata.recoveryStrategy || '',
          timeout: stateMetadata.timeout,
          retryable: stateMetadata.retryable !== false,
          documentation: stateMetadata.documentation || ''
        };
      }

      const doc = {
        name: flowName,
        description: metadata.description || '',
        purpose: metadata.purpose || '',
        version: metadata.version || '1.0.0',
        initial: graph.initial,
        states,
        errorPaths: this.analyzeErrorPaths(graph),
        happyPath: this.analyzeHappyPath(graph),
        complexity: this.calculateComplexity(graph),
        tags: metadata.tags || [],
        examples: metadata.examples || []
      };

      flowDocs.set(flowName, doc);
      return this;
    },

    extractTransitions(stateConfig) {
      const transitions = [];

      if (stateConfig.onDone) {
        transitions.push({ event: 'done', target: stateConfig.onDone, condition: 'success' });
      }

      if (stateConfig.onError) {
        transitions.push({ event: 'error', target: stateConfig.onError, condition: 'failure' });
      }

      if (stateConfig.onTrue) {
        transitions.push({ event: 'true', target: stateConfig.onTrue, condition: 'condition met' });
      }

      if (stateConfig.onFalse) {
        transitions.push({ event: 'false', target: stateConfig.onFalse, condition: 'condition not met' });
      }

      return transitions;
    },

    analyzeErrorPaths(graph) {
      const errorPaths = [];
      const visited = new Set();

      const traverse = (stateName, path) => {
        if (visited.has(stateName)) return;
        visited.add(stateName);

        const state = graph.states[stateName];
        if (!state) return;

        if (state.onError) {
          errorPaths.push({
            trigger: stateName,
            handler: state.onError,
            path: [...path, stateName, state.onError]
          });

          traverse(state.onError, [...path, stateName]);
        } else {
          traverse(state.onDone, [...path, stateName]);
        }
      };

      traverse(graph.initial, []);
      return errorPaths;
    },

    analyzeHappyPath(graph) {
      const path = [];
      let current = graph.initial;

      while (current && graph.states[current]) {
        path.push(current);
        const state = graph.states[current];

        if (state.type === 'final') break;

        current = state.onDone;
      }

      return path;
    },

    calculateComplexity(graph) {
      const states = Object.values(graph.states || {});
      const edges = states.reduce((sum, state) => {
        return sum + (state.onDone ? 1 : 0) + (state.onError ? 1 : 0) +
               (state.onTrue ? 1 : 0) + (state.onFalse ? 1 : 0);
      }, 0);

      return {
        stateCount: states.length,
        edgeCount: edges,
        branchingFactor: edges / states.length,
        complexity: states.length + edges
      };
    },

    getFlowDocumentation(flowName) {
      return flowDocs.get(flowName);
    },

    getFlowSummary(flowName) {
      const doc = flowDocs.get(flowName);
      if (!doc) return null;

      return {
        name: doc.name,
        description: doc.description,
        purpose: doc.purpose,
        stateCount: doc.states.length,
        complexity: doc.complexity.complexity,
        happyPath: doc.happyPath
      };
    },

    generateFlowDiagram(flowName) {
      const doc = flowDocs.get(flowName);
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
    },

    generateFlowMarkdown(flowName) {
      const doc = flowDocs.get(flowName);
      if (!doc) return '';

      let markdown = `# ${doc.name}\n\n`;

      if (doc.purpose) {
        markdown += `**Purpose:** ${doc.purpose}\n\n`;
      }

      if (doc.description) {
        markdown += `${doc.description}\n\n`;
      }

      markdown += `## Flow Information\n\n`;
      markdown += `| Property | Value |\n`;
      markdown += `|----------|-------|\n`;
      markdown += `| Version | ${doc.version} |\n`;
      markdown += `| Initial State | ${doc.initial} |\n`;
      markdown += `| State Count | ${Object.keys(doc.states).length} |\n`;
      markdown += `| Complexity | ${doc.complexity.complexity} |\n\n`;

      markdown += `## States\n\n`;
      for (const [stateName, state] of Object.entries(doc.states)) {
        markdown += `### ${stateName} (${state.type})\n\n`;
        if (state.description) markdown += `${state.description}\n\n`;
        if (state.documentation) markdown += `${state.documentation}\n\n`;

        if (state.transitions.length > 0) {
          markdown += `**Transitions:**\n`;
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

      markdown += `## Execution Paths\n\n`;
      markdown += `**Happy Path:** ${doc.happyPath.join(' → ')}\n\n`;

      if (doc.errorPaths.length > 0) {
        markdown += `**Error Paths:**\n`;
        for (const errorPath of doc.errorPaths) {
          markdown += `- ${errorPath.trigger} → ${errorPath.handler}\n`;
        }
        markdown += '\n';
      }

      return markdown;
    },

    searchFlows(query) {
      const results = [];

      for (const [name, doc] of flowDocs.entries()) {
        const matchesName = name.toLowerCase().includes(query.toLowerCase());
        const matchesDescription = doc.description.toLowerCase().includes(query.toLowerCase());
        const matchesPurpose = doc.purpose.toLowerCase().includes(query.toLowerCase());
        const matchesTag = doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

        if (matchesName || matchesDescription || matchesPurpose || matchesTag) {
          results.push({
            name,
            description: doc.description,
            purpose: doc.purpose,
            complexity: doc.complexity.complexity
          });
        }
      }

      return results;
    }
  };
}

export function generateFlowDocsTemplate() {
  return `/**
 * Flow Documentation
 *
 * Self-documenting flows with state descriptions and error handling strategies.
 */

import { createFlowDocumenter } from '@sequential/flow-docs';

const documenter = createFlowDocumenter();

export const paymentProcessingGraph = {
  initial: 'validatePayment',
  states: {
    validatePayment: { onDone: 'chargeCard', onError: 'handleValidationError' },
    chargeCard: { onDone: 'confirmCharge', onError: 'handleChargeError' },
    confirmCharge: { onDone: 'sendReceipt', onError: 'handleConfirmationError' },
    sendReceipt: { onDone: 'complete', onError: 'handleNotificationError' },
    handleValidationError: { onDone: 'complete' },
    handleChargeError: { onDone: 'complete' },
    handleConfirmationError: { onDone: 'complete' },
    handleNotificationError: { onDone: 'complete' },
    complete: { type: 'final' }
  }
};

// Document the flow
documenter.documentFlow('paymentProcessing', paymentProcessingGraph, {
  purpose: 'Process credit card payments with validation and error recovery',
  description: 'Validates payment details, charges the card, confirms the charge, and sends receipt to customer.',
  version: '1.0.0',
  tags: ['payment', 'critical'],
  states: {
    validatePayment: {
      description: 'Validate card details and amount',
      errorCodes: ['INVALID_CARD', 'INVALID_AMOUNT'],
      recoveryStrategy: 'User re-enters card details'
    },
    chargeCard: {
      description: 'Charge the card via payment processor',
      errorCodes: ['INSUFFICIENT_FUNDS', 'CARD_DECLINED', 'TIMEOUT'],
      recoveryStrategy: 'Retry up to 3 times with exponential backoff',
      timeout: 30000
    },
    confirmCharge: {
      description: 'Confirm charge was successful',
      errorCodes: ['CONFIRMATION_TIMEOUT', 'CONFIRMATION_FAILED'],
      recoveryStrategy: 'Query payment processor for status'
    },
    sendReceipt: {
      description: 'Send email receipt to customer',
      errorCodes: ['EMAIL_INVALID', 'EMAIL_TIMEOUT'],
      recoveryStrategy: 'Queue for retry, user can request receipt later'
    }
  },
  examples: [
    {
      name: 'Successful payment',
      input: { amount: 100, cardToken: 'tok_123' },
      output: { transactionId: 'tx_123', status: 'complete' }
    }
  ]
});

// Get documentation
export function getPaymentFlowDocs() {
  return documenter.getFlowDocumentation('paymentProcessing');
}

// Generate markdown
export function getPaymentFlowMarkdown() {
  return documenter.generateFlowMarkdown('paymentProcessing');
}

// Get summary
export function getPaymentFlowSummary() {
  return documenter.getFlowSummary('paymentProcessing');
}

// Search flows
export function findFlows(query) {
  return documenter.searchFlows(query);
}

// Example: Find all payment-related flows
export function findPaymentFlows() {
  return documenter.searchFlows('payment');
}
`;
}
