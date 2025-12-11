// Preset selector field editor
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
