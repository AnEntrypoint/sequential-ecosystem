/**
 * layout-components.js - Layout component definitions
 *
 * Grid and header layout components
 */

export const LAYOUT_COMPONENTS = {
  grid: {
    name: 'Grid',
    description: 'CSS Grid layout',
    tags: ['layout'],
    jsxCode: `React.createElement(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: props.cols || '1fr 1fr',
          gap: props.gap || '16px',
          marginBottom: '16px'
        }
      },
      props.children || ''
    )`
  },
  header: {
    name: 'Header',
    description: 'Page header with title',
    tags: ['layout', 'header'],
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
