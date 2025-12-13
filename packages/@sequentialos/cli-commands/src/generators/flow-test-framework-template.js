export function createFlowTestRunner(flow) {
  return {
    async run(input, expectedPath = null) {
      const handlers = {};
      const result = await simulateFlow(flow, handlers, input);

      return {
        ...result,
        assertPath(expected) {
          if (expected && result.stateHistory.join('->') !== expected.join('->')) {
            throw new Error(`Path mismatch: ${result.stateHistory.join('->')} !== ${expected.join('->')}`);
          }
        },
        assertFinalState(expected) {
          if (result.finalState !== expected) {
            throw new Error(`Final state mismatch: ${result.finalState} !== ${expected}`);
          }
        }
      };
    }
  };
}

async function simulateFlow(graph, handlers = {}, input) {
  let currentState = graph.initial;
  let context = input;
  const stateHistory = [currentState];

  while (currentState) {
    const state = graph.states[currentState];

    if (!state) {
      throw new Error(`State ${currentState} not found in flow`);
    }

    if (state.type === 'final') {
      break;
    }

    try {
      const handler = handlers[currentState];
      if (handler && typeof handler === 'function') {
        context = await handler(context);
      }

      currentState = state.onDone || null;
      if (currentState) {
        stateHistory.push(currentState);
      }
    } catch (error) {
      currentState = state.onError || null;
      if (currentState) {
        stateHistory.push(currentState);
      }
      context = { error: error.message, ...context };
    }
  }

  return {
    finalState: currentState,
    context,
    stateHistory
  };
}
