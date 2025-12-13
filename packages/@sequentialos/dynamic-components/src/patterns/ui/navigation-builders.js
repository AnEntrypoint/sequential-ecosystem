/**
 * navigation-builders.js - Navigation component builders
 *
 * Pagination and breadcrumb builders
 */

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
