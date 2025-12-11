const defaultStyles = {
  button: {
    padding: '8px 16px',
    backgroundColor: '#667eea',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  heading: {
    margin: '0 0 16px 0',
    fontWeight: '600',
    lineHeight: '1.2'
  },
  paragraph: {
    margin: '0 0 12px 0',
    lineHeight: '1.6',
    color: '#374151'
  },
  image: {
    maxWidth: '100%',
    height: 'auto',
    display: 'block'
  },
  card: {
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  }
};

export function getDefaultStyles(type) {
  return defaultStyles[type] || {};
}

export function getAllDefaultStyles() {
  return defaultStyles;
}
