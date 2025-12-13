/**
 * Flow Composition Analyzer
 * Analyzes flow composition structure and sequence
 */

export function analyzeFlowComposition(graph) {
  const flowCalls = [];
  const flowSequence = [];
  let current = graph.initial;
  const visited = new Set();

  while (current && !visited.has(current)) {
    visited.add(current);
    const state = graph.states[current];

    if (state.type === 'flow-call') {
      flowCalls.push(state.flowName);
      flowSequence.push({
        state: current,
        flow: state.flowName,
        next: state.onDone,
        error: state.onError
      });
      current = state.onDone;
    } else if (state.type === 'final') {
      break;
    } else {
      current = state.onDone;
    }
  }

  return {
    totalFlows: flowCalls.length,
    flows: flowCalls,
    sequence: flowSequence,
    hasErrorHandler: visited.has('handleError')
  };
}
