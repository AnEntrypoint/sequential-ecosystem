// Component preview builders for theme visualization (facade)
import { buildButtonPreview, buildCardPreview, buildInputPreview } from './component-preview-builders.js';

export function buildComponentPreview(theme, type) {
  if (type === 'button') {
    return buildButtonPreview(theme);
  }

  if (type === 'card') {
    return buildCardPreview(theme);
  }

  if (type === 'input') {
    return buildInputPreview(theme);
  }

  return null;
}

export function buildColorPalette(theme) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      backgroundColor: theme.colors.bg,
      borderRadius: '6px',
      border: `1px solid ${theme.colors.border}`
    },
    children: [
      {
        type: 'text',
        content: 'Color Palette',
        style: { fontSize: '11px', fontWeight: 600 }
      },
      {
        type: 'box',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '6px'
        },
        children: Object.entries(theme.colors).slice(0, 10).map(([name, value]) => ({
          type: 'box',
          style: {
            width: '100%',
            paddingBottom: '100%',
            position: 'relative',
            backgroundColor: value,
            borderRadius: '4px',
            border: `1px solid ${theme.colors.border}`,
            title: name
          }
        }))
      }
    ]
  };
}
