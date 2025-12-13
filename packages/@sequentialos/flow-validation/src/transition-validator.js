// Transition and state validation
export class TransitionValidator {
  static validateTransitions(graph) {
    const errors = [];
    const states = Object.keys(graph.states || {});
    const stateSet = new Set(states);

    for (const [stateName, state] of Object.entries(graph.states || {})) {
      const transitions = [state.onDone, state.onError, state.onTrue, state.onFalse].filter(Boolean);
      for (const target of transitions) {
        if (!stateSet.has(target)) {
          errors.push({
            type: 'invalid_transition',
            from: stateName,
            to: target,
            message: `State "${stateName}" transitions to nonexistent state "${target}"`
          });
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  static validateInitialState(graph) {
    const initial = graph.initial;
    const states = Object.keys(graph.states || {});

    if (!initial) {
      return { valid: false, error: 'Graph missing "initial" state' };
    }

    if (!states.includes(initial)) {
      return { valid: false, error: `Initial state "${initial}" not defined in graph.states` };
    }

    return { valid: true };
  }

  static validateAll(graph) {
    const transitions = this.validateTransitions(graph);
    const initial = this.validateInitialState(graph);

    return {
      valid: transitions.valid && initial.valid,
      transitionErrors: transitions.errors,
      initialError: initial.error,
      totalErrors: transitions.errors.length + (initial.error ? 1 : 0)
    };
  }
}
