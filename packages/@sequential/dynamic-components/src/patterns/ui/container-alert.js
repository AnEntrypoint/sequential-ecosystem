export function createAlert(theme, options = {}) {
  const { type = 'info', title = '', message = '', dismissible = false, onDismiss = null } = options;

  const colorMap = {
    success: theme.colors.success,
    danger: theme.colors.danger,
    warning: theme.colors.warning,
    info: theme.colors.info
  };

  return {
    type: 'box',
    style: {
      padding: theme.spacing.lg,
      backgroundColor: `${colorMap[type]}15`,
      border: `1px solid ${colorMap[type]}`,
      borderLeft: `4px solid ${colorMap[type]}`,
      borderRadius: theme.radius.md,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },
    children: [
      {
        type: 'box',
        style: { flex: 1 },
        children: [
          title ? { type: 'heading', content: title, level: 4, style: { margin: 0, color: colorMap[type] } } : null,
          message ? { type: 'paragraph', content: message, style: { margin: '4px 0 0 0' } } : null
        ].filter(Boolean)
      },
      dismissible ? {
        type: 'button',
        content: '×',
        style: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: 0 },
        onClick: onDismiss
      } : null
    ].filter(Boolean)
  };
}
