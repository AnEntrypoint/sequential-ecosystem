// Pattern card UI builder for marketplace display
export function buildPatternCard(pattern) {
  return {
    type: 'box',
    style: {
      padding: '16px',
      backgroundColor: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    children: [
      {
        type: 'heading',
        content: pattern.name,
        level: 4,
        style: { margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }
      },
      {
        type: 'text',
        content: pattern.description,
        style: { margin: '0 0 12px 0', fontSize: '13px', color: '#666', lineHeight: 1.5 }
      },
      {
        type: 'box',
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          fontSize: '12px'
        },
        children: [
          {
            type: 'text',
            content: `By ${pattern.author}`,
            style: { color: '#999' }
          },
          {
            type: 'text',
            content: `${pattern.rating.toFixed(1)} ★`,
            style: { fontWeight: 600, color: '#ffc107' }
          }
        ]
      },
      {
        type: 'box',
        style: {
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap'
        },
        children: pattern.tags.slice(0, 3).map(tag => ({
          type: 'box',
          style: {
            padding: '2px 8px',
            backgroundColor: '#f0f0f0',
            borderRadius: '3px',
            fontSize: '11px',
            color: '#666'
          },
          children: [{ type: 'text', content: tag }]
        }))
      }
    ]
  };
}
