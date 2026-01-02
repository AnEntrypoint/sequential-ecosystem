/**
 * StateMachineVisualizer - Visual representation of xstate machines
 *
 * Displays:
 * - State hierarchy
 * - Context data
 * - Active states and transitions
 * - Available actions
 */

import React, { useMemo } from 'react';

const StateMachineVisualizer = ({ machine, currentState, onTransition, context }) => {
  if (!machine) {
    return (
      <div style={{
        padding: '16px',
        border: '1px solid #d97706',
        borderRadius: '4px',
        backgroundColor: '#fffbeb',
        color: '#92400e'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
          No Machine Loaded
        </h3>
        <p style={{ margin: 0, fontSize: '12px' }}>
          Load an xstate machine to view its visualization
        </p>
      </div>
    );
  }

  const states = useMemo(() => {
    if (!machine.states) return [];
    return Object.entries(machine.states).map(([name, stateConfig]) => ({
      name,
      config: stateConfig,
      isActive: currentState?.name === name || currentState === name
    }));
  }, [machine, currentState]);

  const transitions = useMemo(() => {
    if (!currentState || !machine.states) return [];
    const stateName = typeof currentState === 'string' ? currentState : currentState.name;
    const stateConfig = machine.states[stateName];
    if (!stateConfig || !stateConfig.on) return [];

    return Object.entries(stateConfig.on).map(([event, target]) => {
      const targetState = typeof target === 'string' ? target : target.target;
      return { event, target: targetState };
    });
  }, [currentState, machine]);

  const contextVars = useMemo(() => {
    if (!context || typeof context !== 'object') return [];
    return Object.entries(context);
  }, [context]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '16px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#ffffff'
    }}>
      <div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>
          {machine.id || 'State Machine'}
        </h2>
        {machine.description && (
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            {machine.description}
          </p>
        )}
      </div>

      <div style={{
        padding: '12px',
        backgroundColor: '#f0fdf4',
        border: '1px solid #86efac',
        borderRadius: '6px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#166534' }}>
          Current State
        </h3>
        <div style={{
          fontSize: '13px',
          fontWeight: 500,
          color: '#16a34a',
          fontFamily: 'monospace'
        }}>
          {typeof currentState === 'string' ? currentState : currentState?.name}
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {states.map(state => (
          <div
            key={state.name}
            onClick={() => onTransition?.(state.name)}
            style={{
              padding: '8px 12px',
              backgroundColor: state.isActive ? '#bfdbfe' : '#f3f4f6',
              border: state.isActive ? '2px solid #3b82f6' : '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              color: state.isActive ? '#1e40af' : '#374151',
              transition: 'all 0.2s'
            }}
          >
            {state.name}
            {state.config.type && (
              <span style={{ fontSize: '10px', opacity: 0.7, marginLeft: '4px' }}>
                ({state.config.type})
              </span>
            )}
          </div>
        ))}
      </div>

      {transitions.length > 0 && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 600, color: '#374151' }}>
            Available Transitions
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {transitions.map(trans => (
              <button
                key={trans.event}
                onClick={() => onTransition?.(trans.event)}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#dbeafe',
                  border: '1px solid #93c5fd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#0c4a6e'
                }}
              >
                {trans.event} → {trans.target}
              </button>
            ))}
          </div>
        </div>
      )}

      {contextVars.length > 0 && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 600, color: '#374151' }}>
            Context ({contextVars.length} variables)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {contextVars.map(([key, value]) => (
              <div
                key={key}
                style={{
                  padding: '6px 8px',
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb',
                  fontSize: '10px',
                  fontFamily: 'monospace'
                }}
              >
                <span style={{ fontWeight: 500 }}>{key}</span>: {JSON.stringify(value, null, 2).slice(0, 60)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        padding: '10px',
        backgroundColor: '#f3f4f6',
        borderRadius: '4px',
        border: '1px solid #d1d5db',
        fontSize: '10px',
        color: '#6b7280'
      }}>
        Machine ID: <span style={{ fontFamily: 'monospace' }}>{machine.id || '(unnamed)'}</span>
      </div>
    </div>
  );
};

export default StateMachineVisualizer;
