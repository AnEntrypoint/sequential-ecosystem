// Pattern discovery search UI builder
export function buildSearchUI(allTags) {
  return {
    type: 'flex',
    direction: 'column',
    gap: '16px',
    style: { padding: '20px' },
    children: [
      {
        type: 'flex',
        direction: 'row',
        gap: '12px',
        style: { alignItems: 'center' },
        children: [
          {
            type: 'paragraph',
            content: '🔍',
            style: { margin: 0, fontSize: '20px' }
          },
          {
            type: 'input',
            placeholder: 'Search patterns by name, category, or tags...',
            style: {
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }
          }
        ]
      },
      {
        type: 'flex',
        direction: 'row',
        gap: '8px',
        style: { flexWrap: 'wrap' },
        children: allTags.slice(0, 8).map(tag => ({
          type: 'button',
          label: tag,
          variant: 'secondary',
          style: {
            padding: '6px 12px',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '12px'
          }
        }))
      }
    ]
  };
}
