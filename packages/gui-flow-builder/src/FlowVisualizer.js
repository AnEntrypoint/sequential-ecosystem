/**
 * FlowVisualizer - Visual representation of sequential flows
 *
 * Renders a flow definition as a directed graph showing:
 * - Flow states and transitions
 * - Conditional branches
 * - Error handling paths
 * - Flow metadata
 */

import React, { useMemo } from 'react';
import logger from 'sequential-logging';

const FlowVisualizer = ({ flow, onNodeClick, selectedNode, execution }) => {
  if (!flow || !flow.states) {
    return (
      <div style={{
        padding: '16px',
        border: '1px solid #d97706',
        borderRadius: '4px',
        backgroundColor: '#fffbeb',
        color: '#92400e'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
          Invalid Flow Definition
        </h3>
        <p style={{ margin: 0, fontSize: '12px' }}>
          Flow must have a states property with state definitions
        </p>
      </div>
    );
  }

  const stateNodes = useMemo(() => {
    const nodes = [];
    for (const [stateName, stateConfig] of Object.entries(flow.states)) {
      const isActive = execution?.currentState === stateName;
      const isCompleted = execution?.completedStates?.includes(stateName);

      nodes.push({
        id: stateName,
        label: stateName,
        type: stateConfig.type || 'task',
        isActive,
        isCompleted,
        config: stateConfig
      });
    }
    return nodes;
  }, [flow, execution]);

  const transitions = useMemo(() => {
    const edges = [];
    for (const [fromState, stateConfig] of Object.entries(flow.states)) {
      if (stateConfig.on) {
        for (const [event, target] of Object.entries(stateConfig.on)) {
          const targetState = typeof target === 'string' ? target : target.target;
          edges.push({
            from: fromState,
            to: targetState,
            event
          });
        }
      }
      if (stateConfig.next) {
        const nextState = typeof stateConfig.next === 'string'
          ? stateConfig.next
          : stateConfig.next.target;
        if (nextState) {
          edges.push({
            from: fromState,
            to: nextState,
            event: 'auto'
          });
        }
      }
    }
    return edges;
  }, [flow]);

  const getStateColor = (node) => {
    if (node.isActive) return '#3b82f6';
    if (node.isCompleted) return '#10b981';
    return '#6b7280';
  };

  const getStateBackgroundColor = (node) => {
    if (node.isActive) return '#dbeafe';
    if (node.isCompleted) return '#d1fae5';
    return '#f3f4f6';
  };

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
          {flow.name || 'Flow Diagram'}
        </h2>
        {flow.description && (
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            {flow.description}
          </p>
        )}
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        border: '1px solid #e5e7eb'
      }}>
        {stateNodes.map(node => (
          <button
            key={node.id}
            onClick={() => onNodeClick?.(node)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: selectedNode?.id === node.id ? `2px solid ${getStateColor(node)}` : '1px solid #d1d5db',
              backgroundColor: getStateBackgroundColor(node),
              color: getStateColor(node),
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (selectedNode?.id !== node.id) {
                e.target.style.backgroundColor = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = getStateBackgroundColor(node);
            }}
          >
            <div style={{ fontSize: '10px', opacity: 0.7 }}>{node.type}</div>
            <div>{node.label}</div>
          </button>
        ))}
      </div>

      {transitions.length > 0 && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#374151' }}>
            Transitions ({transitions.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {transitions.map((trans, idx) => (
              <div key={idx} style={{
                fontSize: '11px',
                color: '#6b7280',
                padding: '6px',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                border: '1px solid #e5e7eb'
              }}>
                <span style={{ fontWeight: 500 }}>{trans.from}</span>
                <span style={{ margin: '0 4px', opacity: 0.6 }}>→</span>
                <span style={{ fontWeight: 500 }}>{trans.to}</span>
                <span style={{ marginLeft: '8px', color: '#9ca3af' }}>({trans.event})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowVisualizer;
