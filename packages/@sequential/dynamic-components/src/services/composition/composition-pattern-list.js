// Pattern list builder - displays and manages selected patterns
export function buildPatternList(core) {
  return {
    type: 'box',
    style: { display: 'flex', flexDirection: 'column', gap: '8px' },
    children: [
      {
        type: 'heading',
        content: `Patterns (${core.selectedPatterns.length})`,
        level: 4,
        style: { margin: 0, fontSize: '12px', fontWeight: 600 }
      },
      {
        type: 'box',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          maxHeight: '200px',
          overflow: 'auto'
        },
        children: core.selectedPatterns.length === 0
          ? [{
            type: 'paragraph',
            content: 'No patterns added',
            style: { margin: 0, fontSize: '11px', color: '#6b7280' }
          }]
          : core.selectedPatterns.map((pattern, idx) => ({
            type: 'box',
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px',
              backgroundColor: '#fff',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px'
            },
            children: [
              {
                type: 'paragraph',
                content: `${idx + 1}. ${pattern.id}`,
                style: { margin: 0, flex: 1 }
              },
              {
                type: 'box',
                style: { display: 'flex', gap: '4px' },
                children: [
                  idx > 0 ? {
                    type: 'button',
                    content: '↑',
                    style: {
                      padding: '2px 6px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px'
                    },
                    onClick: () => core.reorderPatterns(idx, idx - 1)
                  } : null,
                  idx < core.selectedPatterns.length - 1 ? {
                    type: 'button',
                    content: '↓',
                    style: {
                      padding: '2px 6px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px'
                    },
                    onClick: () => core.reorderPatterns(idx, idx + 1)
                  } : null,
                  {
                    type: 'button',
                    content: '×',
                    style: {
                      padding: '2px 6px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#ef4444'
                    },
                    onClick: () => core.removePattern(pattern.id)
                  }
                ].filter(Boolean)
              }
            ]
          }))
      }
    ]
  };
}
