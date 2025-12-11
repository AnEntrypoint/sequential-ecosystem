// Profiler dashboard panels (bottlenecks, top patterns, recommendations)
export class ProfilerPanels {
  constructor(profiler) {
    this.profiler = profiler;
  }

  buildBottlenecksPanel(bottlenecks) {
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

  buildTopPatternsPanel(topPatterns) {
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

  buildRecommendationsPanel(stats, bottlenecks) {
    const recommendations = this.profiler.generateRecommendations(stats, bottlenecks);

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
}
