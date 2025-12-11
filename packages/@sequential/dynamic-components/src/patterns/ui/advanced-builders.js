export function createPagination(theme, options = {}) {
  const { currentPage = 1, totalPages = 5, onChange = null } = options;

  return {
    type: 'box',
    style: { display: 'flex', gap: theme.spacing.sm, alignItems: 'center' },
    children: [
      ...Array.from({ length: totalPages }, (_, i) => ({
        type: 'button',
        content: String(i + 1),
        style: {
          padding: theme.spacing.sm,
          backgroundColor: i + 1 === currentPage ? theme.colors.primary : theme.colors.bgSecondary,
          color: i + 1 === currentPage ? '#fff' : theme.colors.text,
          border: 'none',
          borderRadius: theme.radius.md,
          cursor: 'pointer',
          fontSize: '14px',
          minWidth: '32px'
        },
        onClick: () => onChange?.(i + 1)
      }))
    ]
  };
}

export function createBreadcrumb(theme, options = {}) {
  const { items = [] } = options;

  return {
    type: 'box',
    style: { display: 'flex', gap: theme.spacing.sm, alignItems: 'center' },
    children: items.flatMap((item, idx) => [
      {
        type: 'link',
        content: item.label,
        href: item.href || '#',
        style: { color: theme.colors.primary, textDecoration: 'none' }
      },
      idx < items.length - 1 ? { type: 'text', content: '/' } : null
    ]).filter(Boolean)
  };
}

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

export function createHero(theme, options = {}) {
  const { title = '', subtitle = '', image = '', actionButtons = [] } = options;

  return {
    type: 'box',
    style: {
      backgroundImage: `url(${image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: theme.spacing.xxl,
      textAlign: 'center',
      color: '#fff',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    },
    children: [
      title ? { type: 'heading', content: title, level: 1, style: { margin: 0, fontSize: '48px' } } : null,
      subtitle ? { type: 'paragraph', content: subtitle, style: { margin: theme.spacing.lg + ' 0 0 0', fontSize: '20px' } } : null,
      actionButtons.length > 0 ? {
        type: 'box',
        style: { display: 'flex', gap: theme.spacing.md, marginTop: theme.spacing.xl },
        children: actionButtons
      } : null
    ].filter(Boolean)
  };
}

export function createFooter(theme, options = {}) {
  const { sections = [], copyright = '' } = options;

  return {
    type: 'footer',
    style: {
      backgroundColor: theme.colors.bgSecondary,
      padding: theme.spacing.xxl,
      borderTop: `1px solid ${theme.colors.border}`
    },
    children: [
      {
        type: 'box',
        style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing.xl, marginBottom: theme.spacing.xl },
        children: sections.map(section => ({
          type: 'box',
          children: [
            { type: 'heading', content: section.title, level: 4, style: { margin: 0 } },
            { type: 'box', style: { marginTop: theme.spacing.md }, children: section.links }
          ]
        }))
      },
      copyright ? { type: 'paragraph', content: copyright, style: { margin: 0, textAlign: 'center', color: theme.colors.textSecondary } } : null
    ].filter(Boolean)
  };
}
