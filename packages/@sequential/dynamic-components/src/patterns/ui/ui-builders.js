export function buildCustomizerUI(theme, presets) {
  return {
    type: 'box',
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      padding: '20px',
      backgroundColor: '#fafafa'
    },
    children: [
      buildControlPanel(theme, presets),
      buildPreviewPanel(theme)
    ]
  };
}

export function buildControlPanel(theme, presets) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '16px',
      backgroundColor: '#fff',
      borderRadius: '6px',
      maxHeight: 'calc(100vh - 40px)',
      overflow: 'auto'
    },
    children: [
      {
        type: 'heading',
        content: 'Theme Customizer',
        level: 2,
        style: { margin: 0, fontSize: '18px', fontWeight: 700 }
      },
      buildPresetSelector(presets),
      buildColorEditor(theme),
      buildSpacingEditor(theme),
      buildRadiusEditor(theme),
      buildExportControls()
    ]
  };
}

export function buildPresetSelector(presets) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    children: [
      {
        type: 'heading',
        content: 'Presets',
        level: 4,
        style: { margin: 0, fontSize: '13px', fontWeight: 600 }
      },
      {
        type: 'box',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '6px'
        },
        children: Object.entries(presets).map(([key, preset]) => ({
          type: 'button',
          content: preset.name,
          style: {
            padding: '8px 12px',
            backgroundColor: '#e0e0e0',
            color: '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 400
          }
        }))
      }
    ]
  };
}

export function buildColorEditor(theme) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    children: [
      {
        type: 'heading',
        content: 'Colors',
        level: 4,
        style: { margin: 0, fontSize: '13px', fontWeight: 600 }
      },
      {
        type: 'box',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        },
        children: Object.entries(theme.colors).map(([name, value]) => ({
          type: 'box',
          style: {
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          },
          children: [
            {
              type: 'text',
              content: toLabel(name),
              style: { fontSize: '11px', fontWeight: 500, flex: '0 0 70px' }
            },
            {
              type: 'input',
              value: value,
              style: {
                flex: 1,
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '11px'
              }
            },
            {
              type: 'box',
              style: {
                width: '32px',
                height: '32px',
                backgroundColor: value,
                borderRadius: '4px',
                border: '1px solid #ddd'
              }
            }
          ]
        }))
      }
    ]
  };
}

export function buildSpacingEditor(theme) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    children: [
      {
        type: 'heading',
        content: 'Spacing',
        level: 4,
        style: { margin: 0, fontSize: '13px', fontWeight: 600 }
      },
      {
        type: 'box',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        },
        children: Object.entries(theme.spacing).map(([name, value]) => ({
          type: 'box',
          style: {
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          },
          children: [
            {
              type: 'text',
              content: name,
              style: { fontSize: '11px', fontWeight: 500, flex: '0 0 30px' }
            },
            {
              type: 'input',
              value: value,
              style: {
                flex: 1,
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '11px'
              }
            }
          ]
        }))
      }
    ]
  };
}

export function buildRadiusEditor(theme) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    children: [
      {
        type: 'heading',
        content: 'Border Radius',
        level: 4,
        style: { margin: 0, fontSize: '13px', fontWeight: 600 }
      },
      {
        type: 'box',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        },
        children: Object.entries(theme.radius).map(([name, value]) => ({
          type: 'box',
          style: {
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          },
          children: [
            {
              type: 'text',
              content: name,
              style: { fontSize: '11px', fontWeight: 500, flex: '0 0 30px' }
            },
            {
              type: 'input',
              value: value,
              style: {
                flex: 1,
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '11px'
              }
            }
          ]
        }))
      }
    ]
  };
}

export function buildExportControls() {
  return {
    type: 'box',
    style: {
      display: 'flex',
      gap: '8px'
    },
    children: [
      {
        type: 'button',
        content: 'Export CSS',
        style: {
          flex: 1,
          padding: '10px 12px',
          backgroundColor: '#667eea',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '12px'
        }
      },
      {
        type: 'button',
        content: 'Export JSON',
        style: {
          flex: 1,
          padding: '10px 12px',
          backgroundColor: '#f0f0f0',
          color: '#333',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }
      }
    ]
  };
}

export function buildPreviewPanel(theme) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      backgroundColor: theme.colors.surface,
      borderRadius: '6px',
      maxHeight: 'calc(100vh - 40px)',
      overflow: 'auto'
    },
    children: [
      {
        type: 'heading',
        content: 'Preview',
        level: 3,
        style: { margin: 0, fontSize: '14px', fontWeight: 600 }
      },
      buildComponentPreview(theme, 'button'),
      buildComponentPreview(theme, 'card'),
      buildComponentPreview(theme, 'input'),
      buildColorPalette(theme)
    ]
  };
}

export function buildComponentPreview(theme, type) {
  if (type === 'button') {
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

  if (type === 'card') {
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

  if (type === 'input') {
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

function toLabel(name) {
  return name.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + name.replace(/([A-Z])/g, ' $1').trim().slice(1);
}
