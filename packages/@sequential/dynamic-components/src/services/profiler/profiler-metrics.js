// Profiler metrics and dashboard header
export class ProfilerMetrics {
  constructor(profiler) {
    this.profiler = profiler;
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
}
