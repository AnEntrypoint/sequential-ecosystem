// Discovery pattern list panel builder
export function buildPatternList(state) {
  const patterns = state.getFilteredPatterns();

  return {
    type: 'flex',
    direction: 'column',
    gap: '8px',
    style: { flex: 0.6, overflowY: 'auto', maxHeight: '500px' },
    children: patterns.length > 0
      ? patterns.map(pattern => ({
        type: 'box',
        style: {
          padding: '10px 12px',
          border: state.selectedPattern?.id === pattern.id ? '2px solid #0078d4' : '1px solid #e0e0e0',
          borderRadius: '4px',
          background: state.selectedPattern?.id === pattern.id ? '#e7f0ff' : '#f9f9f9',
          cursor: 'pointer',
          transition: 'all 0.2s'
        },
        onClick: () => state.selectPattern(pattern),
        children: [
          {
            type: 'flex',
            gap: '8px',
            alignItems: 'center',
            style: { marginBottom: '6px' },
            children: [
              { type: 'paragraph', content: pattern.icon || '◆', style: { margin: 0, fontSize: '16px' } },
              {
                type: 'flex',
                direction: 'column',
                gap: '2px',
                style: { flex: 1 },
                children: [
                  { type: 'paragraph', content: pattern.name, style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#333' } },
                  { type: 'paragraph', content: `Code reduction: ${pattern.codeReduction}`, style: { margin: 0, fontSize: '10px', color: '#0078d4' } }
                ]
              }
            ]
          },
          { type: 'paragraph', content: pattern.description, style: { margin: 0, fontSize: '11px', color: '#666' } }
        ]
      }))
      : [
        { type: 'paragraph', content: 'No patterns found', style: { textAlign: 'center', color: '#999', padding: '20px 0', margin: 0 } }
      ]
  };
}
