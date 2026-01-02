/**
 * FlowCanvas - Interactive canvas for building and editing flows
 *
 * Features:
 * - Drag-drop component placement
 * - Visual flow editor
 * - Connection management
 * - Property editing
 */

import React, { useState } from 'react';

const FlowCanvas = ({
  flow,
  onFlowChange,
  selectedNode,
  onNodeSelect,
  onDragOver,
  onDrop
}) => {
  const [draggedComponent, setDraggedComponent] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    onDragOver?.(e);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    onDrop?.(draggedComponent, e);
    setDraggedComponent(null);
  };

  const handleNodeDragStart = (node, e) => {
    setDraggedComponent(node);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      border: '2px dashed #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#f9fafb',
      minHeight: '400px',
      position: 'relative'
    }}
    onDragOver={handleDragOver}
    onDrop={handleDrop}
    >
      <div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
          Flow Canvas
        </h2>
        <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>
          Drag components here to build your flow
        </p>
      </div>

      {!flow || !flow.states || Object.keys(flow.states).length === 0 ? (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          fontSize: '13px',
          textAlign: 'center',
          minHeight: '300px'
        }}>
          <p style={{ maxWidth: '300px' }}>
            Drop components from the palette to start building your flow
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '12px',
          padding: '12px'
        }}>
          {flow.states && Object.entries(flow.states).map(([stateName, stateConfig]) => (
            <div
              key={stateName}
              draggable
              onDragStart={(e) => handleNodeDragStart({ name: stateName, config: stateConfig }, e)}
              onClick={() => onNodeSelect?.({ name: stateName, config: stateConfig })}
              style={{
                padding: '12px',
                backgroundColor: selectedNode?.name === stateName ? '#dbeafe' : '#ffffff',
                border: selectedNode?.name === stateName ? '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'move',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                fontSize: '10px',
                color: '#6b7280',
                fontWeight: 500,
                marginBottom: '4px',
                textTransform: 'uppercase'
              }}>
                {stateConfig.type || 'task'}
              </div>
              <div style={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#111827',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {stateName}
              </div>
              {stateConfig.description && (
                <div style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  marginTop: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {stateConfig.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedNode && (
        <div style={{
          padding: '12px',
          backgroundColor: '#dbeafe',
          border: '1px solid #93c5fd',
          borderRadius: '6px'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#1e40af' }}>
            Selected: {selectedNode.name}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '8px',
            fontSize: '10px',
            color: '#1e40af'
          }}>
            {selectedNode.config && Object.entries(selectedNode.config).map(([key, value]) => (
              <div key={key}>
                <span style={{ fontWeight: 500 }}>{key}:</span> {JSON.stringify(value).slice(0, 30)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowCanvas;
