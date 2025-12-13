// Input element builder with labels and error messages
export function createInput(theme, options = {}) {
  const { placeholder = '', value = '', label = null, error = null, size = 'md' } = options;

  const sizeMap = { sm: '8px 8px', md: '8px 12px', lg: '12px 16px' };

  return {
    type: 'box',
    style: { display: 'flex', flexDirection: 'column', gap: theme.spacing.sm },
    children: [
      label ? {
        type: 'paragraph',
        content: label,
        style: { margin: 0, fontSize: '14px', fontWeight: 500, color: theme.colors.text }
      } : null,
      {
        type: 'input',
        placeholder,
        value,
        style: {
          padding: sizeMap[size],
          border: `1px solid ${error ? theme.colors.danger : theme.colors.border}`,
          borderRadius: theme.radius.md,
          fontSize: '14px',
          fontFamily: 'inherit'
        }
      },
      error ? {
        type: 'paragraph',
        content: error,
        style: { margin: 0, fontSize: '12px', color: theme.colors.danger }
      } : null
    ].filter(Boolean)
  };
}
