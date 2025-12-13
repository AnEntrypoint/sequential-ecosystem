// Select element builder with label support
export function createSelect(theme, options = {}) {
  const { label = null, items = [], value = '', onChange = null } = options;

  return {
    type: 'box',
    style: { display: 'flex', flexDirection: 'column', gap: theme.spacing.sm },
    children: [
      label ? {
        type: 'paragraph',
        content: label,
        style: { margin: 0, fontSize: '14px', fontWeight: 500 }
      } : null,
      {
        type: 'select',
        value,
        options: items,
        style: {
          padding: theme.spacing.md,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.md,
          fontSize: '14px'
        },
        onChange
      }
    ].filter(Boolean)
  };
}
