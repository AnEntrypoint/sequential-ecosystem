// UI rendering and export functionality
class ProfilerUI {
  buildProfilerUI(stats, bottlenecks) {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '⚡ Performance Profiler',
          level: 3,
          style: {
            margin: 0,
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        stats ? {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          },
          children: [
            this.buildStatCard('Avg Duration', `${stats.duration.avg.toFixed(2)}ms`),
            this.buildStatCard('P95 Duration', `${stats.duration.p95.toFixed(2)}ms`),
            this.buildStatCard('Total Renders', stats.renders.total.toString()),
            this.buildStatCard('Avg Updates', stats.updates.avg.toFixed(1).toString()),
            this.buildStatCard('Memory Δ', `${(stats.memory.avgDeltaKB / 1024).toFixed(2)}MB`),
            this.buildStatCard('Profiles', stats.profileCount.toString())
          ]
        } : {
          type: 'paragraph',
          content: 'No profiles yet',
          style: {
            margin: 0,
            fontSize: '10px',
            color: '#858585'
          }
        },
        bottlenecks && bottlenecks.length > 0 ? {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '8px'
          },
          children: [
            {
              type: 'heading',
              content: '🐌 Bottlenecks',
              level: 4,
              style: {
                margin: 0,
                fontSize: '10px',
                color: '#ef4444'
              }
            },
            ...bottlenecks.slice(0, 3).map(bn => ({
              type: 'box',
              style: {
                padding: '6px 8px',
                background: '#3e3e42',
                borderRadius: '3px',
                borderLeft: '3px solid #ef4444',
                fontSize: '9px'
              },
              children: [{
                type: 'paragraph',
                content: `${bn.patternId}: ${bn.duration.toFixed(2)}ms (+${bn.excess.toFixed(2)}ms)`,
                style: {
                  margin: 0,
                  color: '#d4d4d4'
                }
              }]
            }))
          ]
        } : null
      ].filter(Boolean)
    };
  }

  buildStatCard(label, value) {
    return {
      type: 'box',
      style: {
        padding: '8px 12px',
        background: '#2d2d30',
        borderRadius: '4px'
      },
      children: [
        {
          type: 'paragraph',
          content: label,
          style: {
            margin: 0,
            fontSize: '9px',
            color: '#858585'
          }
        },
        {
          type: 'heading',
          content: value,
          level: 4,
          style: {
            margin: '4px 0 0 0',
            fontSize: '12px',
            color: '#667eea'
          }
        }
      ]
    };
  }

  exportProfiles(profilesMap, format = 'json', getStatistics) {
    const profiles = Array.from(profilesMap.values()).map(p => ({
      id: p.id,
      patternId: p.patternId,
      duration: p.metrics.duration,
      renders: p.renderCount,
      updates: p.updateCount,
      memoryDeltaKB: (p.metrics.memoryDelta?.usedDelta || 0) / 1024
    }));

    if (format === 'json') {
      return {
        export: 'profiler-data',
        exportedAt: new Date().toISOString(),
        totalProfiles: profiles.length,
        statistics: getStatistics(),
        profiles
      };
    }

    return profiles;
  }
}

export { ProfilerUI };
