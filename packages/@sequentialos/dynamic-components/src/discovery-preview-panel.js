// Discovery pattern preview panel builder
export function buildPreviewPanel(state) {
  if (!state.selectedPattern) {
    return {
      type: 'box',
      style: { flex: 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' },
      children: [{ type: 'paragraph', content: 'Select a pattern to preview', style: { margin: 0 } }]
    };
  }

  const pattern = state.selectedPattern;
  return {
    type: 'flex',
    direction: 'column',
    gap: '12px',
    style: { flex: 0.4, paddingLeft: '16px', borderLeft: '1px solid #e0e0e0' },
    children: [
      {
        type: 'flex',
        direction: 'column',
        gap: '4px',
        children: [
          { type: 'heading', content: pattern.name, level: 3, style: { margin: 0, fontSize: '16px', color: '#333' } },
          { type: 'paragraph', content: pattern.description, style: { margin: 0, fontSize: '12px', color: '#666' } }
        ]
      },
      {
        type: 'flex',
        gap: '8px',
        style: { flexWrap: 'wrap' },
        children: (pattern.tags || []).map(tag => ({
          type: 'box',
          style: {
            background: '#e7f0ff',
            color: '#0078d4',
            padding: '2px 8px',
            borderRadius: '3px',
            fontSize: '10px',
            fontWeight: '500'
          },
          children: [{ type: 'paragraph', content: tag, style: { margin: 0 } }]
        }))
      },
      {
        type: 'flex',
        direction: 'column',
        gap: '6px',
        children: [
          {
            type: 'flex',
            gap: '8px',
            children: [
              { type: 'paragraph', content: 'Code Reduction:', style: { margin: 0, fontSize: '11px', fontWeight: '600', color: '#333' } },
              { type: 'paragraph', content: pattern.codeReduction, style: { margin: 0, fontSize: '11px', color: '#0078d4', fontWeight: '600' } }
            ]
          },
          {
            type: 'flex',
            gap: '8px',
            children: [
              { type: 'paragraph', content: 'Category:', style: { margin: 0, fontSize: '11px', fontWeight: '600', color: '#333' } },
              { type: 'paragraph', content: pattern.category, style: { margin: 0, fontSize: '11px', color: '#666' } }
            ]
          },
          {
            type: 'flex',
            gap: '8px',
            children: [
              { type: 'paragraph', content: 'Author:', style: { margin: 0, fontSize: '11px', fontWeight: '600', color: '#333' } },
              { type: 'paragraph', content: pattern.author || 'system', style: { margin: 0, fontSize: '11px', color: '#666' } }
            ]
          }
        ]
      },
      {
        type: 'button',
        label: '✓ Insert Pattern',
        style: {
          width: '100%',
          padding: '8px 12px',
          background: '#0078d4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '600'
        },
        onClick: () => console.log('Insert pattern:', pattern.id)
      }
    ]
  };
}
