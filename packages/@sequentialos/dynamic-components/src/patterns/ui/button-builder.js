// Button element builder with sizing and variants
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
