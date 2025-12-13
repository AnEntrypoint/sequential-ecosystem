/**
 * layout-builders.js - Layout component builders
 *
 * Hero and footer builders
 */

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
