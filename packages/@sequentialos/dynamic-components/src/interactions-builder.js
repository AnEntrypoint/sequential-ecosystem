// State machine builder and presets
export class InteractionBuilder {
  buildStateMachine(patternDef, stateDefinitions, currentState) {
    const stateConfig = {
      initial: currentState,
      states: {}
    };

    stateDefinitions.states.forEach((state, name) => {
      stateConfig.states[name] = {
        style: state.style,
        animations: state.animations,
        on: {}
      };

      const outgoingTransitions = Array.from(stateDefinitions.transitions.values())
        .filter(t => t.from === name);

      outgoingTransitions.forEach(t => {
        if (!stateConfig.states[name].on[t.trigger]) {
          stateConfig.states[name].on[t.trigger] = [];
        }
        stateConfig.states[name].on[t.trigger].push({
          target: t.to,
          duration: t.duration
        });
      });
    });

    return {
      component: patternDef,
      stateMachine: stateConfig,
      currentState
    };
  }

  createPreset(name, states) {
    return {
      name,
      states
    };
  }

  getCurrentStateStyle(stateDefinitions, currentState) {
    const state = stateDefinitions.getState(currentState);
    return state?.style || {};
  }

  getCurrentStateAnimations(stateDefinitions, currentState) {
    const state = stateDefinitions.getState(currentState);
    return state?.animations || [];
  }
}
