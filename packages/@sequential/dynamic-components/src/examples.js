export const EXAMPLE_COMPONENTS = {
  card: {
    name: 'Card',
    description: 'A simple card component for displaying content',
    jsxCode: `React.createElement(
      'div',
      {
        style: {
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }
      },
      React.createElement('h3', { style: { margin: '0 0 8px 0', color: '#333' } }, props.title || 'Card Title'),
      React.createElement('p', { style: { margin: '0', color: '#666' } }, props.content || 'Card content goes here')
    )`
  },

  button: {
    name: 'Button',
    description: 'A reusable button component',
    jsxCode: `React.createElement(
      'button',
      {
        style: {
          padding: '8px 16px',
          backgroundColor: props.variant === 'primary' ? '#667eea' : '#f0f0f0',
          color: props.variant === 'primary' ? '#fff' : '#333',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s'
        },
        onClick: () => console.log('Button clicked')
      },
      props.label || 'Click me'
    )`
  },

  badge: {
    name: 'Badge',
    description: 'A badge component for labels',
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

  metric: {
    name: 'Metric Card',
    description: 'Display a key metric with label',
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
  },

  input: {
    name: 'Text Input',
    description: 'A text input field',
    jsxCode: `React.createElement(
      'input',
      {
        type: 'text',
        placeholder: props.placeholder || 'Enter text...',
        style: {
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px',
          fontFamily: 'inherit',
          boxSizing: 'border-box'
        },
        onChange: (e) => console.log('Input changed:', e.target.value)
      }
    )`
  },

  alert: {
    name: 'Alert',
    description: 'An alert message component',
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

  grid: {
    name: 'Grid Layout',
    description: '2-column grid layout',
    jsxCode: `React.createElement(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '16px'
        }
      },
      React.createElement(
        'div',
        { style: { padding: '16px', backgroundColor: '#f0f0f0', borderRadius: '4px' } },
        'Column 1'
      ),
      React.createElement(
        'div',
        { style: { padding: '16px', backgroundColor: '#f0f0f0', borderRadius: '4px' } },
        'Column 2'
      )
    )`
  },

  header: {
    name: 'Header',
    description: 'Page header with title',
    jsxCode: `React.createElement(
      'div',
      {
        style: {
          borderBottom: '2px solid #667eea',
          paddingBottom: '16px',
          marginBottom: '24px'
        }
      },
      React.createElement('h1', { style: { margin: '0', color: '#333' } }, props.title || 'Welcome'),
      React.createElement('p', { style: { margin: '8px 0 0 0', color: '#999' } }, props.subtitle || 'Subtitle goes here')
    )`
  }
};
