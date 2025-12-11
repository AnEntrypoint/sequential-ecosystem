// Modal overlay builder with customizable dimensions
export function buildModalOverlay(themeEngine, content, options = {}) {
  return {
    type: 'flex',
    direction: 'column',
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      ...options.style
    },
    children: [
      {
        type: 'card',
        variant: 'elevated',
        style: {
          maxWidth: options.width || '500px',
          maxHeight: options.height || '80vh',
          overflow: 'auto',
          ...options.cardStyle
        },
        children: content
      }
    ]
  };
}
