// Radio button element builder with name and value
export function createRadio(theme, options = {}) {
  const { label = '', name = '', value = '', checked = false, onChange = null } = options;

  return {
    type: 'box',
    style: { display: 'flex', alignItems: 'center', gap: theme.spacing.sm, cursor: 'pointer' },
    children: [
      {
        type: 'input',
        type: 'radio',
        name,
        value,
        checked,
        onChange,
        style: { cursor: 'pointer' }
      },
      label ? { type: 'paragraph', content: label, style: { margin: 0, cursor: 'pointer' } } : null
    ].filter(Boolean)
  };
}
