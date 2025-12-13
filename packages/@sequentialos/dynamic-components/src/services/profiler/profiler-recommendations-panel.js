// Recommendations panel builder - displays optimization recommendations
export function buildRecommendationsPanel(profiler, stats, bottlenecks) {
  const recommendations = profiler.generateRecommendations(stats, bottlenecks);

  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      background: '#2d2d30',
      borderRadius: '4px',
      borderLeft: '3px solid #f59e0b'
    },
    children: [
      {
        type: 'heading',
        content: '💡 Recommendations',
        level: 4,
        style: {
          margin: 0,
          fontSize: '12px',
          color: '#f59e0b',
          textTransform: 'uppercase'
        }
      },
      ...(recommendations.length > 0
        ? recommendations.slice(0, 4).map(rec => ({
          type: 'box',
          style: {
            padding: '8px 10px',
            background: '#3e3e42',
            borderRadius: '3px'
          },
          children: [
            {
              type: 'paragraph',
              content: rec.message,
              style: {
                margin: 0,
                fontSize: '9px',
                color: '#d4d4d4'
              }
            },
            {
              type: 'paragraph',
              content: `Est. improvement: ${rec.estimated_improvement}`,
              style: {
                margin: '2px 0 0 0',
                fontSize: '8px',
                color: '#4ade80'
              }
            }
          ]
        }))
        : [{
          type: 'paragraph',
          content: 'All systems performing optimally',
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
