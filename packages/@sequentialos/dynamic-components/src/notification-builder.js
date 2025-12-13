// Notification builder with type-based styling
export function buildNotification(themeEngine, message, type = 'info', options = {}) {
  const colorMap = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'danger'
  };

  return {
    type: 'card',
    variant: 'elevated',
    style: {
      borderLeft: `4px solid ${themeEngine.getColor(colorMap[type])}`,
      background: themeEngine.getColor('backgroundLight'),
      padding: themeEngine.getSpacing('md'),
      ...options.style
    },
    children: [
      {
        type: 'paragraph',
        content: message,
        style: { color: themeEngine.getColor('text') }
      }
    ]
  };
}
