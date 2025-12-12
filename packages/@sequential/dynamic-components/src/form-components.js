/**
 * form-components.js - Form component definitions
 *
 * Form input components
 */

export const FORM_COMPONENTS = {
  input: {
    name: 'Text Input',
    description: 'Text input field',
    tags: ['form', 'input'],
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
        onChange: props.onChange
      }
    )`
  }
};
