// Bottlenecks panel builder - displays performance bottlenecks
export function buildBottlenecksPanel(bottlenecks) {
  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      background: '#2d2d30',
      borderRadius: '4px',
      borderLeft: '3px solid #ef4444'
    },
    children: [
      {
        type: 'heading',
        content: '🐌 Bottlenecks',
        level: 4,
        style: {
          margin: 0,
          fontSize: '12px',
          color: '#ef4444',
          textTransform: 'uppercase'
        }
      },
      ...(bottlenecks.length > 0
        ? bottlenecks.slice(0, 5).map(bn => ({
          type: 'box',
          style: {
            padding: '8px 10px',
            background: '#3e3e42',
            borderRadius: '3px',
            borderLeft: '2px solid #ef4444'
          },
          children: [
            {
              type: 'paragraph',
              content: bn.patternId,
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
              content: `${bn.duration.toFixed(2)}ms (+${bn.excess.toFixed(2)}ms over 16.67ms target)`,
              style: {
                margin: '2px 0 0 0',
                fontSize: '9px',
                color: '#ef4444'
              }
            },
            {
              type: 'paragraph',
              content: `Renders: ${bn.renders} | Updates: ${bn.updates}`,
              style: {
                margin: '2px 0 0 0',
                fontSize: '8px',
                color: '#858585'
              }
            }
          ]
        }))
        : [{
          type: 'paragraph',
          content: 'No bottlenecks detected',
          style: {
            margin: 0,
            fontSize: '9px',
            color: '#4ade80',
            textAlign: 'center',
            padding: '8px'
          }
        }])
    ]
  };
}
