// Top patterns panel builder - displays top performing patterns
export function buildTopPatternsPanel(topPatterns) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      background: '#2d2d30',
      borderRadius: '4px',
      borderLeft: '3px solid #667eea'
    },
    children: [
      {
        type: 'heading',
        content: '⭐ Top Patterns',
        level: 4,
        style: {
          margin: 0,
          fontSize: '12px',
          color: '#667eea',
          textTransform: 'uppercase'
        }
      },
      ...topPatterns.map((p, idx) => ({
        type: 'box',
        style: {
          padding: '8px 10px',
          background: '#3e3e42',
          borderRadius: '3px'
        },
        children: [
          {
            type: 'paragraph',
            content: `${idx + 1}. ${p.patternId}`,
            style: {
              margin: 0,
              fontSize: '10px',
              color: '#d4d4d4',
              fontWeight: 500,
              wordBreak: 'break-all'
            }
          },
          {
            type: 'paragraph',
            content: `${p.stats?.duration.avg.toFixed(2)}ms avg (${p.stats?.profileCount} profiles)`,
            style: {
              margin: '2px 0 0 0',
              fontSize: '9px',
              color: '#858585'
            }
          }
        ]
      }))
    ]
  };
}
