export class ProfilerDashboard {
  constructor(profiler) {
    this.profiler = profiler;
  }

  buildMainDashboard() {
    const stats = this.profiler.getStatistics();
    const bottlenecks = this.profiler.identifyBottlenecks();
    const topPatterns = this.profiler.getTopPatterns('duration', 5);

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
        this.buildDashboardHeader(),
        this.buildMetricsGrid(stats),
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          },
          children: [
            this.buildBottlenecksPanel(bottlenecks),
            this.buildTopPatternsPanel(topPatterns)
          ]
        },
        this.buildRecommendationsPanel(stats, bottlenecks)
      ]
    };
  }

  buildDashboardHeader() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      },
      children: [
        {
          type: 'heading',
          content: '⚡ Performance Dashboard',
          level: 2,
          style: {
            margin: 0,
            fontSize: '16px',
            color: '#e0e0e0'
          }
        },
        {
          type: 'paragraph',
          content: `${this.profiler.profiles.size} profiles`,
          style: {
            margin: 0,
            fontSize: '11px',
            color: '#858585'
          }
        }
      ]
    };
  }

  buildMetricsGrid(stats) {
    if (!stats) {
      return {
        type: 'paragraph',
        content: 'No performance data available yet',
        style: {
          margin: 0,
          fontSize: '11px',
          color: '#858585',
          padding: '20px',
          textAlign: 'center'
        }
      };
    }

    return {
      type: 'box',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px'
      },
      children: [
        this.buildMetricCard('Duration (avg)', `${stats.duration.avg.toFixed(2)}ms`, '#667eea'),
        this.buildMetricCard('P95 Duration', `${stats.duration.p95.toFixed(2)}ms`, stats.duration.p95 > 50 ? '#ef4444' : '#4ade80'),
        this.buildMetricCard('P99 Duration', `${stats.duration.p99.toFixed(2)}ms`, stats.duration.p99 > 100 ? '#ef4444' : '#4ade80'),
        this.buildMetricCard('Total Renders', stats.renders.total.toString(), '#667eea'),
        this.buildMetricCard('Avg Renders', stats.renders.avg.toFixed(1), stats.renders.avg > 3 ? '#f59e0b' : '#4ade80'),
        this.buildMetricCard('Memory Δ', `${(stats.memory.avgDeltaKB / 1024).toFixed(2)}MB`, '#667eea'),
        this.buildMetricCard('Min Duration', `${stats.duration.min.toFixed(2)}ms`, '#4ade80'),
        this.buildMetricCard('Max Duration', `${stats.duration.max.toFixed(2)}ms`, stats.duration.max > 100 ? '#ef4444' : '#f59e0b'),
        this.buildMetricCard('Total Profiles', stats.profileCount.toString(), '#667eea')
      ]
    };
  }

  buildMetricCard(label, value, color = '#667eea') {
    return {
      type: 'box',
      style: {
        padding: '12px',
        background: '#2d2d30',
        borderRadius: '4px',
        borderTop: `3px solid ${color}`
      },
      children: [
        {
          type: 'paragraph',
          content: label,
          style: {
            margin: 0,
            fontSize: '10px',
            color: '#858585',
            textTransform: 'uppercase'
          }
        },
        {
          type: 'heading',
          content: value,
          level: 3,
          style: {
            margin: '6px 0 0 0',
            fontSize: '14px',
            color,
            fontWeight: 600
          }
        }
      ]
    };
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
