/**
 * Flow Test Utilities
 * Helper functions for testing flows
 */

export async function runFlow(graph, handlers, input) {
  let currentState = graph.initial;
  let context = input;
  const stateHistory = [currentState];

  while (currentState) {
    const state = graph.states[currentState];

    if (!state) {
      throw new Error(`State ${currentState} not found`);
    }

    if (state.type === 'final') {
      break;
    }

    try {
      const handler = handlers[currentState];
      if (handler) {
        context = await handler(context);
      }

      currentState = state.onDone;
      stateHistory.push(currentState);
    } catch (error) {
      currentState = state.onError;
      stateHistory.push(currentState);
      context = { error: error.message };
    }
  }

  return {
    finalState: currentState,
    context,
    stateHistory
  };
}

export function assertFlowPath(stateHistory, expectedPath) {
  const actualPath = stateHistory.filter(s => s);
  for (let i = 0; i < expectedPath.length; i++) {
    if (actualPath[i] !== expectedPath[i]) {
      throw new Error(
        `Expected path ${expectedPath.join(' -> ')} but got ${actualPath.join(' -> ')}`
      );
    }
  }
}

export function assertFinalState(result, expectedState) {
  if (result.finalState !== expectedState) {
    throw new Error(
      `Expected final state ${expectedState} but got ${result.finalState}`
    );
  }
}
