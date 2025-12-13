/**
 * Flow Documenter
 * Creates and manages flow documentation
 */

import { extractTransitions, analyzeErrorPaths, analyzeHappyPath, calculateComplexity } from './flow-analyzer.js';

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
          transitions: extractTransitions(stateConfig),
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
        errorPaths: analyzeErrorPaths(graph),
        happyPath: analyzeHappyPath(graph),
        complexity: calculateComplexity(graph),
        tags: metadata.tags || [],
        examples: metadata.examples || []
      };

      flowDocs.set(flowName, doc);
      return this;
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
