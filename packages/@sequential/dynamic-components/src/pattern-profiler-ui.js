class PatternProfilerUI {
  constructor(profiler) {
    this.profiler = profiler;
    this.selectedProfileId = null;
    this.selectedMetric = 'duration';
    this.filterPattern = null;
    this.showDetailView = false;
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

  buildProfileDetailView(profileId) {
    const profile = this.profiler.getProfile(profileId);
    if (!profile) return null;

    return {
      type: 'box',
      style: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#1e1e1e',
        borderRadius: '6px',
        border: '1px solid #3e3e42',
        padding: '20px',
        zIndex: 10000,
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      },
      children: [
        {
          type: 'heading',
          content: `Profile: ${profile.patternId}`,
          level: 2,
          style: {
            margin: '0 0 12px 0',
            color: '#667eea'
          }
        },
        {
          type: 'paragraph',
          content: `Duration: ${profile.metrics.duration?.toFixed(2)}ms`,
          style: {
            margin: '8px 0',
            fontSize: '11px',
            color: '#d4d4d4'
          }
        },
        {
          type: 'paragraph',
          content: `Renders: ${profile.renderCount} | Updates: ${profile.updateCount}`,
          style: {
            margin: '8px 0',
            fontSize: '11px',
            color: '#d4d4d4'
          }
        },
        {
          type: 'paragraph',
          content: `Memory Δ: ${(profile.metrics.memoryDelta?.usedDelta || 0) / 1024}KB`,
          style: {
            margin: '8px 0',
            fontSize: '11px',
            color: '#d4d4d4'
          }
        },
        profile.events.length > 0 ? {
          type: 'box',
          style: {
            marginTop: '16px'
          },
          children: [
            {
              type: 'heading',
              content: 'Events',
              level: 4,
              style: {
                margin: '0 0 8px 0',
                fontSize: '11px',
                color: '#e0e0e0'
              }
            },
            {
              type: 'box',
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                maxHeight: '300px',
                overflow: 'auto'
              },
              children: profile.events.map(event => ({
                type: 'paragraph',
                content: `${event.relativeTime.toFixed(2)}ms - ${event.type}`,
                style: {
                  margin: 0,
                  fontSize: '9px',
                  color: '#858585',
                  padding: '4px 8px',
                  background: '#2d2d30',
                  borderRadius: '2px'
                }
              }))
            }
          ]
        } : null
      ].filter(Boolean)
    };
  }

  buildComparationView(patternId1, patternId2) {
    const comparison = this.profiler.comparePatterns(patternId1, patternId2);
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
}

function createPatternProfilerUI(profiler) {
  return new PatternProfilerUI(profiler);
}

export { PatternProfilerUI, createPatternProfilerUI };
