// Checkbox element builder with label
export function createCheckbox(theme, options = {}) {
  const { label = '', checked = false, onChange = null } = options;

  return {
    type: 'box',
    style: { display: 'flex', alignItems: 'center', gap: theme.spacing.sm, cursor: 'pointer' },
    children: [
      {
        type: 'input',
        type: 'checkbox',
        checked,
        onChange,
        style: { cursor: 'pointer' }
      },
      label ? { type: 'paragraph', content: label, style: { margin: 0, cursor: 'pointer' } } : null
    ].filter(Boolean)
  };
}
