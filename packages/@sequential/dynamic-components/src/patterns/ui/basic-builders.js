export function createButton(theme, options = {}) {
  const {
    content = 'Button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    onClick = null
  } = options;

  const sizeMap = { sm: '6px 12px', md: '8px 16px', lg: '12px 24px' };
  const colorMap = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    success: theme.colors.success,
    danger: theme.colors.danger
  };

  return {
    type: 'button',
    content,
    style: {
      padding: sizeMap[size],
      backgroundColor: colorMap[variant],
      color: '#ffffff',
      border: 'none',
      borderRadius: theme.radius.md,
      fontSize: '14px',
      fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'opacity 0.2s'
    },
    onClick: disabled ? null : onClick
  };
}

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

export function createBadge(theme, options = {}) {
  const { content = '', variant = 'primary', size = 'md' } = options;

  const sizeMap = { sm: '4px 8px', md: '6px 12px', lg: '8px 16px' };
  const colorMap = {
    primary: { bg: theme.colors.primary, text: '#fff' },
    secondary: { bg: theme.colors.secondary, text: '#fff' },
    success: { bg: theme.colors.success, text: '#fff' },
    danger: { bg: theme.colors.danger, text: '#fff' },
    warning: { bg: theme.colors.warning, text: '#fff' }
  };

  const colors = colorMap[variant];

  return {
    type: 'box',
    style: {
      display: 'inline-block',
      padding: sizeMap[size],
      backgroundColor: colors.bg,
      color: colors.text,
      borderRadius: theme.radius.full,
      fontSize: '12px',
      fontWeight: 600
    },
    children: [{ type: 'text', content }]
  };
}
