/**
 * display-builders.js - Display component builders
 *
 * Progress, spinner, and avatar builders
 */

export function createProgress(theme, options = {}) {
  const { value = 0, max = 100, label = null } = options;

  const percent = Math.round((value / max) * 100);

  return {
    type: 'box',
    style: { display: 'flex', flexDirection: 'column', gap: theme.spacing.sm },
    children: [
      label ? { type: 'paragraph', content: `${label} (${percent}%)`, style: { margin: 0, fontSize: '12px' } } : null,
      {
        type: 'box',
        style: {
          width: '100%',
          height: '8px',
          backgroundColor: theme.colors.bgSecondary,
          borderRadius: theme.radius.full,
          overflow: 'hidden'
        },
        children: [{
          type: 'box',
          style: {
            width: `${percent}%`,
            height: '100%',
            backgroundColor: theme.colors.success,
            transition: 'width 0.3s ease'
          }
        }]
      }
    ].filter(Boolean)
  };
}

export function createSpinner(theme, options = {}) {
  const { size = 'md' } = options;

  const sizeMap = { sm: '20px', md: '40px', lg: '60px' };

  return {
    type: 'box',
    style: {
      width: sizeMap[size],
      height: sizeMap[size],
      border: `4px solid ${theme.colors.bgSecondary}`,
      borderTop: `4px solid ${theme.colors.primary}`,
      borderRadius: theme.radius.full,
      animation: 'spin 0.8s linear infinite'
    }
  };
}

export function createAvatar(theme, options = {}) {
  const { src = '', alt = '', size = 'md', initials = '' } = options;

  const sizeMap = { sm: '32px', md: '40px', lg: '56px' };

  return {
    type: 'box',
    style: {
      width: sizeMap[size],
      height: sizeMap[size],
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '14px',
      fontWeight: 600,
      overflow: 'hidden'
    },
    children: [
      src ? { type: 'image', src, alt } : { type: 'text', content: initials }
    ]
  };
}
