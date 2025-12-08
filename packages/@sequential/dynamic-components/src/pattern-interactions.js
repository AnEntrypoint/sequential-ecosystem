class PatternInteractionStates {
  constructor() {
    this.states = new Map();
    this.transitions = new Map();
    this.eventHandlers = new Map();
    this.currentState = 'default';
    this.history = [];
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

  addEventHandler(stateName, eventType, handler) {
    if (!this.eventHandlers.has(stateName)) {
      this.eventHandlers.set(stateName, new Map());
    }

    const handlers = this.eventHandlers.get(stateName);
    if (!handlers.has(eventType)) {
      handlers.set(eventType, []);
    }

    handlers.get(eventType).push(handler);
  }

  transitionTo(stateName, context = {}) {
    const fromState = this.currentState;
    const toState = stateName;

    const transition = this.transitions.get(`${fromState}→${toState}`);

    if (transition) {
      if (transition.condition && !transition.condition(context)) {
        return { success: false, reason: 'Condition not met' };
      }

      const fromStateObj = this.states.get(fromState);
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

      const toStateObj = this.states.get(toState);
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

  handleEvent(eventType, context = {}) {
    const stateObj = this.states.get(this.currentState);
    if (!stateObj) return false;

    const handlers = this.eventHandlers.get(this.currentState);
    if (!handlers) return false;

    const eventHandlers = handlers.get(eventType) || [];
    let handled = false;

    eventHandlers.forEach(handler => {
      try {
        const result = handler(context);
        if (result) handled = true;
      } catch (e) {
        console.error(`Error in event handler for ${eventType}:`, e);
      }
    });

    return handled;
  }

  getCurrentStateStyle() {
    const state = this.states.get(this.currentState);
    return state?.style || {};
  }

  getCurrentStateAnimations() {
    const state = this.states.get(this.currentState);
    return state?.animations || [];
  }

  getTransitionStyle(targetState) {
    const transition = this.transitions.get(`${this.currentState}→${targetState}`);
    if (!transition) return {};

    return {
      transition: `all ${transition.duration}ms ${transition.easing}`
    };
  }

  buildStateMachine(patternDef) {
    const stateConfig = {
      initial: this.currentState,
      states: {}
    };

    this.states.forEach((state, name) => {
      stateConfig.states[name] = {
        style: state.style,
        animations: state.animations,
        on: {}
      };

      const outgoingTransitions = Array.from(this.transitions.values())
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
      currentState: this.currentState
    };
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

  buildStateVisualization() {
    const states = Array.from(this.states.keys());
    const transitions = Array.from(this.transitions.values());

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '🎬 Interaction States',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.max(2, Math.min(states.length, 4))}, 1fr)`,
            gap: '8px'
          },
          children: states.map(state => ({
            type: 'box',
            style: {
              padding: '8px 12px',
              background: this.currentState === state ? '#667eea' : '#2d2d30',
              borderRadius: '4px',
              border: `1px solid ${this.currentState === state ? '#667eea' : '#3e3e42'}`,
              cursor: 'pointer'
            },
            children: [{
              type: 'paragraph',
              content: state,
              style: {
                margin: 0,
                fontSize: '10px',
                color: this.currentState === state ? '#fff' : '#d4d4d4',
                fontWeight: this.currentState === state ? 600 : 400
              }
            }]
          }))
        },
        transitions.length > 0 ? {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          },
          children: [
            {
              type: 'heading',
              content: 'Transitions',
              level: 4,
              style: { margin: 0, fontSize: '10px', color: '#858585' }
            },
            ...transitions.slice(0, 5).map(t => ({
              type: 'paragraph',
              content: `${t.from} → ${t.to} (${t.trigger})`,
              style: {
                margin: 0,
                fontSize: '9px',
                color: '#d4d4d4',
                padding: '4px 6px',
                background: '#2d2d30',
                borderRadius: '3px'
              }
            }))
          ]
        } : null
      ].filter(Boolean)
    };
  }

  applyStateToCo mponent(component) {
    const state = this.states.get(this.currentState);
    if (!state) return component;

    const styled = JSON.parse(JSON.stringify(component));

    if (!styled.style) {
      styled.style = {};
    }

    Object.assign(styled.style, state.style);

    if (state.animations.length > 0) {
      styled.animations = state.animations;
    }

    return styled;
  }

  createPreset(name, states) {
    const preset = new PatternInteractionStates();

    Object.entries(states).forEach(([stateName, config]) => {
      preset.defineState(stateName, config);
    });

    return preset;
  }

  exportStateConfig() {
    return {
      currentState: this.currentState,
      states: Array.from(this.states.entries()).map(([name, state]) => ({
        name,
        style: state.style,
        animations: state.animations
      })),
      transitions: Array.from(this.transitions.entries()).map(([key, trans]) => ({
        from: trans.from,
        to: trans.to,
        trigger: trans.trigger,
        duration: trans.duration
      })),
      history: this.getStateHistory()
    };
  }
}

function createPatternInteractionStates() {
  return new PatternInteractionStates();
}

export { PatternInteractionStates, createPatternInteractionStates };
