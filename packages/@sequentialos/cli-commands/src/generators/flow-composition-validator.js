/**
 * Flow Composition Validator
 * Validates flow composition structure and state references
 */

export function validateFlowComposition(composition) {
  const issues = [];

  if (!composition.name || typeof composition.name !== 'string') {
    issues.push('Composition must have a name (string)');
  }

  if (!composition.graph) {
    issues.push('Composition must have a graph definition');
    return { valid: false, issues };
  }

  const graph = composition.graph;

  if (!graph.initial) {
    issues.push('Graph must define an initial state');
  }

  if (!graph.states || Object.keys(graph.states).length === 0) {
    issues.push('Graph must have at least one state');
  }

  for (const [stateName, state] of Object.entries(graph.states || {})) {
    if (state.type === 'flow-call' && !state.flowName) {
      issues.push(`State ${stateName}: flow-call state must have flowName`);
    }

    if (state.onDone && !graph.states[state.onDone]) {
      issues.push(`State ${stateName}: references non-existent state ${state.onDone}`);
    }

    if (state.onError && !graph.states[state.onError]) {
      issues.push(`State ${stateName}: references non-existent state ${state.onError}`);
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
