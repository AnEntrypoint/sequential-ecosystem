// Layout selector builder - handles layout mode selection UI
export function buildLayoutSelector(core) {
  const layouts = ['grid', 'flex', 'stack', 'carousel'];

  return {
    type: 'box',
    style: { display: 'flex', flexDirection: 'column', gap: '8px' },
    children: [
      {
        type: 'heading',
        content: 'Layout',
        level: 4,
        style: { margin: 0, fontSize: '12px', fontWeight: 600 }
      },
      {
        type: 'box',
        style: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
        children: layouts.map(layout => ({
          type: 'button',
          content: layout.charAt(0).toUpperCase() + layout.slice(1),
          style: {
            padding: '6px 12px',
            backgroundColor: core.layoutMode === layout ? '#667eea' : '#e5e7eb',
            color: core.layoutMode === layout ? '#fff' : '#374151',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: core.layoutMode === layout ? 600 : 400
          },
          onClick: () => core.setLayoutMode(layout)
        }))
      }
    ]
  };
}
