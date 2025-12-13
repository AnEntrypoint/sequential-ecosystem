/**
 * Flow Composition Builder
 * Creates flow graph structures for composed workflows
 */

export function composeFlows(name, description, flowSequence = []) {
  if (flowSequence.length === 0) {
    throw new Error('At least one flow is required in sequence');
  }

  const graph = {
    initial: 'flow-0',
    states: {}
  };

  for (let i = 0; i < flowSequence.length; i++) {
    const flow = flowSequence[i];
    const flowId = 'flow-' + i;
    const nextFlow = i < flowSequence.length - 1 ? 'flow-' + (i + 1) : 'final';

    graph.states[flowId] = {
      type: 'flow-call',
      flowName: typeof flow === 'string' ? flow : flow.name,
      onDone: nextFlow,
      onError: 'handleError'
    };
  }

  graph.states.handleError = {
    type: 'final',
    handler: 'captureError'
  };

  graph.states.final = {
    type: 'final'
  };

  return {
    name,
    description,
    graph,
    metadata: {
      type: 'composed-flow',
      flowCount: flowSequence.length,
      createdAt: new Date().toISOString()
    }
  };
}
