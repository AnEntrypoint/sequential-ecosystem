/**
 * feedback-components.js - Feedback component definitions
 *
 * Badge, alert, and metric display components
 */

export const FEEDBACK_COMPONENTS = {
  badge: {
    name: 'Badge',
    description: 'Badge for labels and tags',
    tags: ['display', 'label'],
    jsxCode: `React.createElement(
      'span',
      {
        style: {
          display: 'inline-block',
          padding: '4px 12px',
          backgroundColor: props.color || '#667eea',
          color: '#fff',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }
      },
      props.label || 'Badge'
    )`
  },
  alert: {
    name: 'Alert',
    description: 'Alert message component',
    tags: ['feedback', 'message'],
    jsxCode: `React.createElement(
      'div',
      {
        style: {
          padding: '12px 16px',
          backgroundColor: props.type === 'error' ? '#fee' : props.type === 'success' ? '#efe' : '#eef',
          color: props.type === 'error' ? '#c33' : props.type === 'success' ? '#3c3' : '#33c',
          borderRadius: '4px',
          border: '1px solid ' + (props.type === 'error' ? '#fcc' : props.type === 'success' ? '#cfc' : '#ccf'),
          marginBottom: '16px'
        }
      },
      props.message || 'This is an alert'
    )`
  },
  metric: {
    name: 'Metric Card',
    description: 'Display KPI or metric',
    tags: ['display', 'data'],
    jsxCode: `React.createElement(
      'div',
      {
        style: {
          padding: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          textAlign: 'center'
        }
      },
      React.createElement('p', { style: { margin: '0 0 8px 0', color: '#999', fontSize: '12px' } }, props.label || 'Metric'),
      React.createElement('h2', { style: { margin: '0', color: '#667eea', fontSize: '32px' } }, props.value || '0')
    )`
  }
};
