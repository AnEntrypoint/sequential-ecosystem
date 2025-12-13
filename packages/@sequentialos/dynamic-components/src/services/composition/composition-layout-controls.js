// Layout controls builder - grid and flex configuration UI
export function buildLayoutControls(core) {
  return {
    type: 'box',
    style: { display: 'flex', flexDirection: 'column', gap: '8px' },
    children: [
      {
        type: 'heading',
        content: 'Layout Settings',
        level: 4,
        style: { margin: 0, fontSize: '12px', fontWeight: 600 }
      },
      core.layoutMode === 'grid'
        ? buildGridControls(core)
        : buildFlexControls(core)
    ]
  };
}

function buildGridControls(core) {
  return {
    type: 'box',
    style: { display: 'flex', flexDirection: 'column', gap: '6px' },
    children: [
      {
        type: 'box',
        style: { display: 'flex', gap: '8px', alignItems: 'center' },
        children: [
          { type: 'paragraph', content: 'Columns:', style: { margin: 0, fontSize: '11px', flex: '0 0 70px' } },
          { type: 'input', value: core.gridConfig.columns, style: { padding: '4px 8px', fontSize: '11px', flex: 1 } }
        ]
      },
      {
        type: 'box',
        style: { display: 'flex', gap: '8px', alignItems: 'center' },
        children: [
          { type: 'paragraph', content: 'Gap:', style: { margin: 0, fontSize: '11px', flex: '0 0 70px' } },
          { type: 'input', value: core.gridConfig.gap, style: { padding: '4px 8px', fontSize: '11px', flex: 1 } }
        ]
      }
    ]
  };
}

function buildFlexControls(core) {
  return {
    type: 'box',
    style: { display: 'flex', flexDirection: 'column', gap: '6px' },
    children: [
      {
        type: 'box',
        style: { display: 'flex', gap: '8px', alignItems: 'center' },
        children: [
          { type: 'paragraph', content: 'Direction:', style: { margin: 0, fontSize: '11px', flex: '0 0 70px' } },
          {
            type: 'select',
            options: ['row', 'column'],
            value: core.layoutConfig.direction,
            style: { padding: '4px 8px', fontSize: '11px', flex: 1 }
          }
        ]
      },
      {
        type: 'box',
        style: { display: 'flex', gap: '8px', alignItems: 'center' },
        children: [
          { type: 'paragraph', content: 'Gap:', style: { margin: 0, fontSize: '11px', flex: '0 0 70px' } },
          { type: 'input', value: core.layoutConfig.gap, style: { padding: '4px 8px', fontSize: '11px', flex: 1 } }
        ]
      }
    ]
  };
}
