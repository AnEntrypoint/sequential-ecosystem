/**
 * ExecutionMonitor - Real-time execution tracking and monitoring
 *
 * Displays:
 * - Current execution state
 * - Step-by-step progress
 * - Error details
 * - Execution timeline
 * - Performance metrics
 */

import React, { useMemo } from 'react';

const ExecutionMonitor = ({ execution, onRetry, onCancel }) => {
  if (!execution) {
    return (
      <div style={{
        padding: '16px',
        border: '1px dashed #9ca3af',
        borderRadius: '4px',
        backgroundColor: '#f9fafb',
        color: '#6b7280'
      }}>
        <p style={{ margin: 0, fontSize: '12px' }}>
          No execution data available. Run a flow to see details here.
        </p>
      </div>
    );
  }

  const statusColor = {
    running: '#3b82f6',
    completed: '#10b981',
    failed: '#ef4444',
    pending: '#9ca3af'
  }[execution.status] || '#6b7280';

  const statusBg = {
    running: '#dbeafe',
    completed: '#d1fae5',
    failed: '#fee2e2',
    pending: '#f3f4f6'
  }[execution.status] || '#f3f4f6';

  const timeline = useMemo(() => {
    return (execution.steps || []).map((step, idx) => ({
      ...step,
      index: idx,
      duration: step.endedAt && step.startedAt
        ? new Date(step.endedAt) - new Date(step.startedAt)
        : null
    }));
  }, [execution.steps]);

  const totalDuration = execution.startedAt && execution.endedAt
    ? new Date(execution.endedAt) - new Date(execution.startedAt)
    : null;

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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px',
        backgroundColor: statusBg,
        borderRadius: '6px',
        border: `1px solid ${statusColor}`
      }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: statusColor }}>
            {execution.id}
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            Status: <span style={{ fontWeight: 500 }}>{execution.status}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {execution.status === 'running' && (
            <button
              onClick={onCancel}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid #ef4444',
                backgroundColor: '#ffffff',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500
              }}
            >
              Cancel
            </button>
          )}
          {execution.status === 'failed' && (
            <button
              onClick={onRetry}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid #3b82f6',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500
              }}
            >
              Retry
            </button>
          )}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '8px'
      }}>
        {execution.startedAt && (
          <div style={{
            padding: '8px',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 500 }}>Started</div>
            <div style={{ fontSize: '11px', color: '#111827', fontFamily: 'monospace' }}>
              {new Date(execution.startedAt).toLocaleTimeString()}
            </div>
          </div>
        )}
        {totalDuration && (
          <div style={{
            padding: '8px',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 500 }}>Duration</div>
            <div style={{ fontSize: '11px', color: '#111827', fontFamily: 'monospace' }}>
              {(totalDuration / 1000).toFixed(2)}s
            </div>
          </div>
        )}
        {execution.currentState && (
          <div style={{
            padding: '8px',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 500 }}>Current State</div>
            <div style={{ fontSize: '11px', color: '#111827', fontFamily: 'monospace' }}>
              {execution.currentState}
            </div>
          </div>
        )}
      </div>

      {execution.error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '6px'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#991b1b' }}>
            Error
          </h3>
          <p style={{ margin: 0, fontSize: '11px', color: '#7f1d1d', fontFamily: 'monospace' }}>
            {execution.error.message || execution.error}
          </p>
          {execution.error.code && (
            <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#9f1239' }}>
              Code: {execution.error.code}
            </p>
          )}
        </div>
      )}

      {timeline.length > 0 && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 600, color: '#374151' }}>
            Execution Timeline ({timeline.length} steps)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {timeline.map(step => (
              <div key={step.index} style={{
                padding: '8px',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                fontSize: '11px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 500, color: '#111827' }}>
                    {step.index + 1}. {step.name || step.state}
                  </span>
                  <span style={{
                    color: step.status === 'completed' ? '#10b981' : step.status === 'failed' ? '#ef4444' : '#6b7280',
                    fontSize: '10px'
                  }}>
                    {step.status}
                  </span>
                </div>
                {step.duration && (
                  <div style={{ color: '#6b7280', fontSize: '10px' }}>
                    Duration: {(step.duration / 1000).toFixed(2)}s
                  </div>
                )}
                {step.output && (
                  <div style={{
                    color: '#6b7280',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    marginTop: '4px',
                    padding: '4px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '2px',
                    maxHeight: '50px',
                    overflow: 'auto'
                  }}>
                    {typeof step.output === 'string'
                      ? step.output
                      : JSON.stringify(step.output, null, 2).slice(0, 200)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionMonitor;
