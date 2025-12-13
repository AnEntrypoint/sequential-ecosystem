export function createConditionalFlowRunner() {
  return {
    async executeConditionalFlow(graph, handlers, input) {
      let currentState = graph.initial;
      let context = input;
      const history = [{ state: currentState, input, timestamp: new Date().toISOString() }];

      while (currentState && graph.states[currentState]) {
        const state = graph.states[currentState];

        if (state.type === 'final') {
          history.push({ state: currentState, context, final: true });
          break;
        }

        if (state.type === 'conditional') {
          const conditionResult = executeConditional(state.condition, context);
          currentState = conditionResult ? state.onTrue : state.onFalse;
          history.push({
            state,
            conditionResult,
            nextState: currentState,
            timestamp: new Date().toISOString()
          });
        } else if (state.type === 'switch') {
          const selectorResult = executeSwitch(state.selector, context);
          currentState = state.cases[selectorResult] || state.default;
          history.push({
            state,
            selected: selectorResult,
            nextState: currentState,
            timestamp: new Date().toISOString()
          });
        } else if (state.onDone) {
          const handler = handlers[currentState];
          if (handler) {
            context = await handler(context);
          }
          currentState = state.onDone;
          history.push({
            state: currentState,
            context,
            timestamp: new Date().toISOString()
          });
        } else {
          break;
        }
      }

      return {
        finalState: currentState,
        context,
        history,
        success: currentState === 'final'
      };
    }
  };
}
