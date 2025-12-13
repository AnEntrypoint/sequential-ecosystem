// UI and visualization for interaction states
export class InteractionUI {
  buildStateVisualization(stateDefinitions, currentState) {
    const states = Array.from(stateDefinitions.states.keys());
    const transitions = Array.from(stateDefinitions.transitions.values());

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
              background: currentState === state ? '#667eea' : '#2d2d30',
              borderRadius: '4px',
              border: `1px solid ${currentState === state ? '#667eea' : '#3e3e42'}`,
              cursor: 'pointer'
            },
            children: [{
              type: 'paragraph',
              content: state,
              style: {
                margin: 0,
                fontSize: '10px',
                color: currentState === state ? '#fff' : '#d4d4d4',
                fontWeight: currentState === state ? 600 : 400
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

  getTransitionStyle(stateDefinitions, fromState, toState) {
    const transition = stateDefinitions.getTransition(fromState, toState);
    if (!transition) return {};

    return {
      transition: `all ${transition.duration}ms ${transition.easing}`
    };
  }

  applyStateToComponent(component, state) {
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
}
