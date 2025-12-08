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
