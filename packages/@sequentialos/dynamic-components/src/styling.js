export const baseStyles = {
  box: {
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box'
  },
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spacing: (p, m = 0) => ({
    padding: typeof p === 'number' ? `${p}px` : p,
    margin: typeof m === 'number' ? `${m}px` : m
  }),
  text: {
    reset: { margin: 0, padding: 0 },
    heading: { fontWeight: 600, lineHeight: 1.2 },
    body: { fontSize: '14px', lineHeight: 1.5 }
  },
  border: {
    light: '1px solid #e0e0e0',
    dark: '1px solid #424242',
    none: 'none'
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '999px'
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)'
  },
  color: {
    primary: '#667eea',
    success: '#48bb78',
    warning: '#f6ad55',
    error: '#f56565',
    gray: '#a0aec0',
    text: '#2d3748',
    textLight: '#718096'
  }
};

export const createClassName = (styles) => {
  return Object.entries(styles)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        return Object.entries(value)
          .map(([k, v]) => `${k}:${v}`)
          .join(';');
      }
      return `${key}:${value}`;
    })
    .join(';');
};

export const mergeStyles = (...styleObjects) => {
  return Object.assign({}, ...styleObjects);
};

export const responsiveValue = (mobile, tablet, desktop) => {
  if (typeof window === 'undefined') return desktop;
  const width = window.innerWidth;
  if (width < 768) return mobile;
  if (width < 1024) return tablet;
  return desktop;
};
