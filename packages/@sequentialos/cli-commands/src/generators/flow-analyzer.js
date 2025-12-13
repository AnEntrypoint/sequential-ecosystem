/**
 * Flow Analyzer
 * Analyzes flow graphs for transitions, paths, and complexity
 */

export function extractTransitions(stateConfig) {
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
}

export function analyzeErrorPaths(graph) {
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
}

export function analyzeHappyPath(graph) {
  const path = [];
  let current = graph.initial;

  while (current && graph.states[current]) {
    path.push(current);
    const state = graph.states[current];

    if (state.type === 'final') break;

    current = state.onDone;
  }

  return path;
}

export function calculateComplexity(graph) {
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
}
