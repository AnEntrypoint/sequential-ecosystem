export function createModal(theme, options = {}) {
  const { title = '', content = '', footer = null, onClose = null } = options;

  return {
    type: 'box',
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    children: [{
      type: 'box',
      style: {
        backgroundColor: theme.colors.bg,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadows.xl,
        padding: theme.spacing.xl,
        maxWidth: '500px',
        width: '90%'
      },
      children: [
        {
          type: 'box',
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg },
          children: [
            title ? { type: 'heading', content: title, level: 3, style: { margin: 0 } } : null,
            {
              type: 'button',
              content: '×',
              style: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: 0 },
              onClick: onClose
            }
          ].filter(Boolean)
        },
        content ? { type: 'paragraph', content, style: { margin: 0 } } : null,
        footer ? {
          type: 'box',
          style: {
            display: 'flex',
            gap: theme.spacing.md,
            marginTop: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
            borderTop: `1px solid ${theme.colors.border}`
          },
          children: Array.isArray(footer) ? footer : [footer]
        } : null
      ].filter(Boolean)
    }]
  };
}
