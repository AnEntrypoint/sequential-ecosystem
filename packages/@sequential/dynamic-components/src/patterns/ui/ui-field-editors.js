// Field editor components for theme customization
import { toLabel } from './ui-utilities.js';

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
