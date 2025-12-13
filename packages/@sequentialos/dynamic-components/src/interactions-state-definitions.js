// State and transition definitions
export class InteractionStateDefinitions {
  constructor() {
    this.states = new Map();
    this.transitions = new Map();
  }

  defineState(stateName, config) {
    const state = {
      name: stateName,
      style: config.style || {},
      animations: config.animations || [],
      events: config.events || {},
      onEnter: config.onEnter || null,
      onExit: config.onExit || null,
      metadata: config.metadata || {}
    };

    this.states.set(stateName, state);
    return state;
  }

  defineTransition(fromState, toState, trigger, config = {}) {
    const key = `${fromState}→${toState}`;
    const transition = {
      from: fromState,
      to: toState,
      trigger,
      duration: config.duration || 200,
      easing: config.easing || 'ease-in-out',
      condition: config.condition || null,
      onComplete: config.onComplete || null
    };

    this.transitions.set(key, transition);
    return transition;
  }

  getTransition(fromState, toState) {
    return this.transitions.get(`${fromState}→${toState}`);
  }

  getState(stateName) {
    return this.states.get(stateName);
  }
}
