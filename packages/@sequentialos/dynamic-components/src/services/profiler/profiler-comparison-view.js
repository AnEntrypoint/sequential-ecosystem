// Comparison view builder - displays comparison between two patterns
export function buildComparisonView(profiler, patternId1, patternId2) {
  const comparison = profiler.comparePatterns(patternId1, patternId2);
  if (!comparison) return null;

  return {
    type: 'box',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      background: '#1e1e1e',
      borderRadius: '6px'
    },
    children: [
      {
        type: 'heading',
        content: 'Pattern Comparison',
        level: 3,
        style: {
          margin: 0,
          fontSize: '14px',
          color: '#667eea'
        }
      },
      {
        type: 'box',
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        },
        children: [
          {
            type: 'box',
            style: {
              padding: '12px',
              background: '#2d2d30',
              borderRadius: '4px'
            },
            children: [
              {
                type: 'paragraph',
                content: comparison.patternId1,
                style: {
                  margin: 0,
                  fontSize: '10px',
                  color: '#858585'
                }
              },
              {
                type: 'heading',
                content: `${comparison.duration.pattern1Avg.toFixed(2)}ms`,
                level: 4,
                style: {
                  margin: '6px 0 0 0',
                  fontSize: '16px',
                  color: '#667eea'
                }
              }
            ]
          },
          {
            type: 'box',
            style: {
              padding: '12px',
              background: '#2d2d30',
              borderRadius: '4px'
            },
            children: [
              {
                type: 'paragraph',
                content: comparison.patternId2,
                style: {
                  margin: 0,
                  fontSize: '10px',
                  color: '#858585'
                }
              },
              {
                type: 'heading',
                content: `${comparison.duration.pattern2Avg.toFixed(2)}ms`,
                level: 4,
                style: {
                  margin: '6px 0 0 0',
                  fontSize: '16px',
                  color: comparison.duration.ratio > 1 ? '#ef4444' : '#4ade80'
                }
              }
            ]
          }
        ]
      },
      {
        type: 'paragraph',
        content: `Faster: ${comparison.duration.faster} (${(Math.abs(comparison.duration.ratio - 1) * 100).toFixed(1)}% difference)`,
        style: {
          margin: 0,
          fontSize: '11px',
          color: '#d4d4d4',
          padding: '8px 12px',
          background: '#2d2d30',
          borderRadius: '4px'
        }
      }
    ]
  };
}
