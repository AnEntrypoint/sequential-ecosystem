// Color editor field editor
import { toLabel } from './ui-utilities.js';

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
