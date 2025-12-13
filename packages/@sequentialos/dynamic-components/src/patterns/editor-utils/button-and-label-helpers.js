/**
 * button-and-label-helpers.js
 *
 * Button and label UI component helpers
 */

export function createButton(label, onClick, style = {}, variant = 'primary') {
  const variants = {
    primary: { bg: '#667eea', color: '#fff' },
    secondary: { bg: '#3a3a3a', color: '#e0e0e0' },
    danger: { bg: '#dc3545', color: '#fff' },
    success: { bg: '#28a745', color: '#fff' }
  };

  const v = variants[variant] || variants.primary;

  return {
    type: 'button',
    content: label,
    style: {
      padding: '8px 16px',
      backgroundColor: v.bg,
      color: v.color,
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 600,
      ...style
    },
    onClick
  };
}

export function createLabel(text, style = {}) {
  return {
    type: 'paragraph',
    content: text,
    style: {
      margin: 0,
      fontSize: '11px',
      fontWeight: 600,
      color: '#858585',
      ...style
    }
  };
}
