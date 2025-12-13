// Card element builder with title, content, and footer
export function createCard(theme, options = {}) {
  const { title = null, content = null, children = [], footer = null } = options;

  return {
    type: 'box',
    style: {
      backgroundColor: theme.colors.bg,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.radius.lg,
      boxShadow: theme.shadows.md,
      padding: theme.spacing.lg,
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.md
    },
    children: [
      title ? { type: 'heading', content: title, level: 3, style: { margin: 0 } } : null,
      content ? { type: 'paragraph', content, style: { margin: 0, color: theme.colors.textSecondary } } : null,
      ...children,
      footer ? {
        type: 'box',
        style: {
          paddingTop: theme.spacing.md,
          borderTop: `1px solid ${theme.colors.border}`,
          display: 'flex',
          gap: theme.spacing.md
        },
        children: Array.isArray(footer) ? footer : [footer]
      } : null
    ].filter(Boolean)
  };
}
