// Transition execution and history tracking
export class InteractionTransitionEngine {
  constructor() {
    this.currentState = 'default';
    this.history = [];
  }

  transitionTo(stateName, stateDefinitions, context = {}) {
    const fromState = this.currentState;
    const toState = stateName;

    const transition = stateDefinitions.getTransition(fromState, toState);

    if (transition) {
      if (transition.condition && !transition.condition(context)) {
        return { success: false, reason: 'Condition not met' };
      }

      const fromStateObj = stateDefinitions.getState(fromState);
      if (fromStateObj?.onExit) {
        fromStateObj.onExit(context);
      }

      this.currentState = toState;
      this.history.push({
        from: fromState,
        to: toState,
        timestamp: Date.now(),
        context
      });

      const toStateObj = stateDefinitions.getState(toState);
      if (toStateObj?.onEnter) {
        toStateObj.onEnter(context);
      }

      if (transition.onComplete) {
        setTimeout(() => transition.onComplete(context), transition.duration);
      }

      return {
        success: true,
        from: fromState,
        to: toState,
        duration: transition.duration,
        easing: transition.easing
      };
    }

    return { success: false, reason: 'Transition not defined' };
  }

  getCurrentState() {
    return this.currentState;
  }

  getStateHistory(limit = 10) {
    return this.history.slice(-limit).map((entry, idx) => ({
      step: idx + 1,
      from: entry.from,
      to: entry.to,
      timestamp: new Date(entry.timestamp).toISOString(),
      context: entry.context
    }));
  }

  exportConfig(stateDefinitions) {
    return {
      currentState: this.currentState,
      states: Array.from(stateDefinitions.states.entries()).map(([name, state]) => ({
        name,
        style: state.style,
        animations: state.animations
      })),
      transitions: Array.from(stateDefinitions.transitions.entries()).map(([key, trans]) => ({
        from: trans.from,
        to: trans.to,
        trigger: trans.trigger,
        duration: trans.duration
      })),
      history: this.getStateHistory()
    };
  }
}
