// Category and tags sections builder
export function buildCategorySection(stats) {
  return {
    type: 'flex',
    direction: 'column',
    gap: '12px',
    style: { marginTop: '16px' },
    children: [
      {
        type: 'paragraph',
        content: 'Patterns by Category:',
        style: { margin: 0, fontSize: '14px', fontWeight: '600' }
      },
      {
        type: 'flex',
        direction: 'row',
        gap: '8px',
        style: { flexWrap: 'wrap' },
        children: Object.entries(stats.patternsPerCategory).map(([cat, count]) => ({
          type: 'box',
          style: {
            padding: '8px 12px',
            background: '#e8f5e9',
            color: '#2e7d32',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600'
          },
          children: [
            {
              type: 'paragraph',
              content: `${cat}: ${count}`,
              style: { margin: 0 }
            }
          ]
        }))
      }
    ]
  };
}

export function buildTagsSection(stats) {
  return {
    type: 'flex',
    direction: 'column',
    gap: '12px',
    style: { marginTop: '16px' },
    children: [
      {
        type: 'paragraph',
        content: 'Most Used Tags:',
        style: { margin: 0, fontSize: '14px', fontWeight: '600' }
      },
      {
        type: 'flex',
        direction: 'row',
        gap: '8px',
        style: { flexWrap: 'wrap' },
        children: stats.mostCommonTags.map(({ tag, count }) => ({
          type: 'box',
          style: {
            padding: '8px 12px',
            background: '#e3f2fd',
            color: '#0078d4',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '500'
          },
          children: [
            {
              type: 'paragraph',
              content: `${tag} (${count})`,
              style: { margin: 0 }
            }
          ]
        }))
      }
    ]
  };
}
