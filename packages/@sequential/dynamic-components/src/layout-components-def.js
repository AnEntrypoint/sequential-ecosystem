/**
 * layout-components-def.js - Layout component definitions
 *
 * JSX code templates for box, flex, grid, stack, container, and semantic components
 */

export const LAYOUT_COMPONENTS = {
  box: {
    description: 'Flexible container with padding and styling',
    jsxCode: `React.createElement(
      'div',
      {
        style: {
          padding: props.p || '0px',
          margin: props.m || '0px',
          backgroundColor: props.bg || 'transparent',
          borderRadius: props.r || '0px',
          border: props.border || 'none',
          width: props.w || 'auto',
          height: props.h || 'auto',
          ...props.style
        }
      },
      props.children || ''
    )`
  },

  flex: {
    description: 'Flexbox layout with configurable direction and alignment',
    jsxCode: `React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: props.dir || 'row',
          gap: props.gap || '0px',
          alignItems: props.align || 'stretch',
          justifyContent: props.justify || 'flex-start',
          flexWrap: props.wrap || 'nowrap',
          width: props.w || '100%',
          height: props.h || 'auto',
          padding: props.p || '0px',
          ...props.style
        }
      },
      props.children || ''
    )`
  },

  grid: {
    description: 'CSS Grid layout with customizable columns and gap',
    jsxCode: `React.createElement(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: props.cols || 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: props.gap || '16px',
          padding: props.p || '0px',
          width: props.w || '100%',
          ...props.style
        }
      },
      props.children || ''
    )`
  },

  stack: {
    description: 'Vertical stack (flex column) with spacing between items',
    jsxCode: `React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: props.gap || '12px',
          width: props.w || '100%',
          alignItems: props.align || 'stretch',
          ...props.style
        }
      },
      props.children || ''
    )`
  },

  hstack: {
    description: 'Horizontal stack (flex row) with spacing between items',
    jsxCode: `React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'row',
          gap: props.gap || '12px',
          alignItems: props.align || 'center',
          width: props.w || '100%',
          ...props.style
        }
      },
      props.children || ''
    )`
  },

  container: {
    description: 'Centered container with max-width',
    jsxCode: `React.createElement(
      'div',
      {
        style: {
          maxWidth: props.max || '1200px',
          margin: '0 auto',
          padding: props.p || '0 16px',
          width: '100%',
          ...props.style
        }
      },
      props.children || ''
    )`
  },

  divider: {
    description: 'Horizontal or vertical divider line',
    jsxCode: `React.createElement(
      'div',
      {
        style: {
          width: props.dir === 'v' ? '1px' : '100%',
          height: props.dir === 'v' ? props.h || '100%' : '1px',
          backgroundColor: props.color || '#e0e0e0',
          margin: props.m || '12px 0'
        }
      }
    )`
  },

  spacer: {
    description: 'Empty space with flexible width/height',
    jsxCode: `React.createElement(
      'div',
      {
        style: {
          flex: props.flex || 1,
          width: props.w,
          height: props.h,
          minWidth: props.minW,
          minHeight: props.minH
        }
      }
    )`
  },

  section: {
    description: 'Semantic section with padding and background',
    jsxCode: `React.createElement(
      'section',
      {
        style: {
          padding: props.p || '24px',
          backgroundColor: props.bg || '#fff',
          borderRadius: props.r || '8px',
          border: props.border || '1px solid #e0e0e0',
          marginBottom: props.mb || '16px',
          ...props.style
        }
      },
      props.children || ''
    )`
  },

  card: {
    description: 'Card container with shadow and hover effect',
    jsxCode: `React.createElement(
      'div',
      {
        style: {
          padding: props.p || '16px',
          backgroundColor: props.bg || '#fff',
          borderRadius: props.r || '8px',
          boxShadow: props.shadow || '0 2px 4px rgba(0,0,0,0.1)',
          border: props.border || 'none',
          transition: 'all 0.2s',
          cursor: props.clickable ? 'pointer' : 'default',
          ...props.style
        },
        onMouseEnter: props.onHover ? () => console.log('Card hover') : undefined,
        ...props.events
      },
      props.children || ''
    )`
  }
};
