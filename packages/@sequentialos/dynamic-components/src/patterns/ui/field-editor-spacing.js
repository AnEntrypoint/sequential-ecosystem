// Spacing editor field editor
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
