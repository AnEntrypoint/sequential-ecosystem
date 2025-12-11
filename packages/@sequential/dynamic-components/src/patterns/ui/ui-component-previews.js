// Component preview builders for theme visualization
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

function buildButtonPreview(theme) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      padding: '12px',
      backgroundColor: theme.colors.bg,
      borderRadius: '6px',
      border: `1px solid ${theme.colors.border}`
    },
    children: [
      {
        type: 'button',
        content: 'Primary',
        style: {
          padding: '8px 16px',
          backgroundColor: theme.colors.primary,
          color: '#fff',
          border: 'none',
          borderRadius: theme.radius.md,
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 600
        }
      },
      {
        type: 'button',
        content: 'Secondary',
        style: {
          padding: '8px 16px',
          backgroundColor: theme.colors.secondary,
          color: '#fff',
          border: 'none',
          borderRadius: theme.radius.md,
          cursor: 'pointer',
          fontSize: '12px'
        }
      },
      {
        type: 'button',
        content: 'Success',
        style: {
          padding: '8px 16px',
          backgroundColor: theme.colors.success,
          color: '#fff',
          border: 'none',
          borderRadius: theme.radius.md,
          cursor: 'pointer',
          fontSize: '12px'
        }
      }
    ]
  };
}

function buildCardPreview(theme) {
  return {
    type: 'box',
    style: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.bg,
      borderRadius: theme.radius.lg,
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.md
    },
    children: [
      {
        type: 'heading',
        content: 'Card Title',
        level: 4,
        style: { margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: theme.colors.text }
      },
      {
        type: 'paragraph',
        content: 'This is a preview of the card component with the current theme applied.',
        style: { margin: 0, fontSize: '12px', color: theme.colors.textSecondary }
      }
    ]
  };
}

function buildInputPreview(theme) {
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
        content: 'Input Label',
        style: { fontSize: '12px', fontWeight: 600, color: theme.colors.text }
      },
      {
        type: 'input',
        placeholder: 'Enter text...',
        style: {
          padding: '8px 12px',
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.colors.border}`,
          fontSize: '12px'
        }
      }
    ]
  };
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
