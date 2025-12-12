/**
 * button-components.js - Button component definitions
 *
 * Button components
 */

export const BUTTON_COMPONENTS = {
  button: {
    name: 'Button',
    description: 'Reusable button with variants',
    tags: ['interactive', 'input'],
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
        onClick: props.onClick
      },
      props.label || 'Click me'
    )`
  }
};
