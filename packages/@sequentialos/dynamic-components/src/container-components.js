/**
 * container-components.js - Container component definitions
 *
 * Card and section containers
 */

export const CONTAINER_COMPONENTS = {
  card: {
    name: 'Card',
    description: 'Card container with shadow',
    tags: ['container', 'display'],
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
  section: {
    name: 'Section',
    description: 'Semantic section with padding',
    tags: ['container', 'layout'],
    jsxCode: `React.createElement(
      'section',
      {
        style: {
          padding: props.p || '24px',
          backgroundColor: props.bg || '#fff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginBottom: '16px'
        }
      },
      props.children || ''
    )`
  }
};
