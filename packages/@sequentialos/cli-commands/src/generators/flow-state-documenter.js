/**
 * Flow State Documenter
 * Creates documentation for individual flow states
 */

import { extractTransitions, analyzeErrorPaths, analyzeHappyPath, calculateComplexity } from './flow-analyzer.js';

export function createFlowStateDocumenter() {
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

      return {
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
    }
  };
}
