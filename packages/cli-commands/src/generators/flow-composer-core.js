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
    const flowId = `flow-${i}`;
    const nextFlow = i < flowSequence.length - 1 ? `flow-${i + 1}` : 'final';

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

export function generateComposedFlowTemplate(flowName, flows = []) {
  const flowNames = flows.map(f => `'${f}'`).join(', ');

  return `/**
 * ${flowName} - Composed Flow
 *
 * Chains multiple flows together into a larger workflow.
 * Flows execute sequentially: ${flowNames || 'define flows below'}
 *
 * Architecture:
 * flow-0 (onDone) -> flow-1 (onDone) -> ... -> final
 *           (onError) -> handleError
 */

export const graph = {
  initial: 'flow-0',
  states: {
    'flow-0': {
      type: 'flow-call',
      flowName: 'first-flow',
      onDone: 'flow-1',
      onError: 'handleError'
    },
    'flow-1': {
      type: 'flow-call',
      flowName: 'second-flow',
      onDone: 'final',
      onError: 'handleError'
    },
    handleError: {
      type: 'final'
    },
    final: {
      type: 'final'
    }
  }
};

// Handler for first flow result
export async function processFlowResult(context) {
  // Transform output from first flow for input to second flow
  return context;
}

// Error handler
export async function handleError(error) {
  console.error('Flow composition error:', error);
  return { error: error.message, success: false };
}

/**
 * Usage:
 * 1. Define your flows separately (flow1.js, flow2.js)
 * 2. This composed flow chains them together
 * 3. Output from first flow becomes input to second flow
 * 4. On error, the handleError state is invoked
 */
`;
}

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
