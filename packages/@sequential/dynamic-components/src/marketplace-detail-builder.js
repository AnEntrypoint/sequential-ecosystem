// Marketplace detail view builder
export class MarketplaceDetailBuilder {
  buildDetailView(patternId, marketplace) {
    const pattern = marketplace.patterns.get(patternId);

    if (!pattern) return null;

    const reviews = marketplace.reviews.filter(r => r.patternId === patternId);

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
        backgroundColor: '#fafafa',
        maxWidth: '600px'
      },
      children: [
        {
          type: 'heading',
          content: pattern.name,
          level: 2,
          style: { margin: 0, fontSize: '24px', fontWeight: 700 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            fontSize: '12px'
          },
          children: [
            { type: 'text', content: `By ${pattern.author}` },
            { type: 'text', content: `v${pattern.version}` },
            { type: 'text', content: `${pattern.rating.toFixed(1)} ★ (${pattern.reviewCount} reviews)` },
            { type: 'text', content: `${pattern.downloadCount} downloads`, style: { color: '#666' } }
          ]
        },
        {
          type: 'paragraph',
          content: pattern.description,
          style: { margin: 0, fontSize: '13px', lineHeight: 1.6 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          },
          children: pattern.tags.map(tag => ({
            type: 'box',
            style: {
              padding: '4px 8px',
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              borderRadius: '3px',
              fontSize: '11px'
            },
            children: [{ type: 'text', content: tag }]
          }))
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            gap: '8px'
          },
          children: [
            {
              type: 'button',
              content: '⬇ Insert Pattern',
              style: {
                padding: '10px 16px',
                backgroundColor: '#667eea',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600
              }
            },
            {
              type: 'button',
              content: '❤ Favorite',
              style: {
                padding: '10px 16px',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }
            }
          ]
        },
        {
          type: 'heading',
          content: 'Reviews',
          level: 4,
          style: { margin: '12px 0 0 0', fontSize: '14px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          },
          children: reviews.slice(0, 3).map(review => ({
            type: 'box',
            style: {
              padding: '12px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px'
            },
            children: [
              {
                type: 'text',
                content: `${review.rating} ★ by ${review.userId}`,
                style: { fontWeight: 600, fontSize: '12px' }
              },
              {
                type: 'paragraph',
                content: review.title,
                style: { margin: '4px 0', fontSize: '11px', fontWeight: 500 }
              },
              {
                type: 'paragraph',
                content: review.content,
                style: { margin: 0, fontSize: '11px', color: '#666' }
              }
            ]
          }))
        }
      ]
    };
  }
}
