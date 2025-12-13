// Badge element builder with variants and sizes
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
