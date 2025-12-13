// Preview UI and comparison visualization
export class PreviewUI {
  buildPreviewPanel(previewComponent, metrics) {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px',
        flex: 1
      },
      children: [
        {
          type: 'heading',
          content: '👁️ Live Preview',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
        },
        this.buildPreviewContainer(previewComponent),
        this.buildPerformancePanel(metrics)
      ]
    };
  }

  buildPreviewContainer(previewComponent) {
    if (!previewComponent) {
      return {
        type: 'box',
        style: {
          padding: '40px',
          background: '#2d2d30',
          borderRadius: '6px',
          border: '2px dashed #3e3e42',
          textAlign: 'center'
        },
        children: [{
          type: 'paragraph',
          content: 'No pattern selected for preview',
          style: { margin: 0, fontSize: '11px', color: '#858585' }
        }]
      };
    }

    return {
      type: 'box',
      style: {
        padding: '20px',
        background: '#2d2d30',
        borderRadius: '6px',
        border: '1px solid #3e3e42',
        minHeight: '300px',
        overflow: 'auto'
      },
      children: [JSON.parse(JSON.stringify(previewComponent))]
    };
  }

  buildPerformancePanel(metrics) {
    const isSmooth = metrics.jankPercent < 5;
    const statusColor = isSmooth ? '#4ade80' : metrics.jankPercent < 20 ? '#f59e0b' : '#ef4444';

    return {
      type: 'box',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px'
      },
      children: [
        this.buildMetricCard('FPS', String(metrics.fps), statusColor),
        this.buildMetricCard('Frame Time', `${metrics.averageFrameTime.toFixed(2)}ms`, statusColor),
        this.buildMetricCard('Jank', `${metrics.jankPercent}%`, statusColor)
      ]
    };
  }

  buildMetricCard(label, value, color) {
    return {
      type: 'box',
      style: {
        padding: '8px 12px',
        background: '#3e3e42',
        borderRadius: '4px',
        borderTop: `3px solid ${color}`
      },
      children: [
        {
          type: 'paragraph',
          content: label,
          style: { margin: 0, fontSize: '9px', color: '#858585' }
        },
        {
          type: 'heading',
          content: value,
          level: 4,
          style: { margin: '4px 0 0 0', fontSize: '14px', color: '#d4d4d4', fontWeight: 600 }
        }
      ]
    };
  }

  buildComparisonUI(changes) {
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
          content: '🔄 Snapshot Comparison',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          },
          children: changes.slice(0, 10).map(change => ({
            type: 'box',
            style: {
              padding: '8px',
              background: '#2d2d30',
              borderRadius: '4px',
              borderLeft: '3px solid #667eea'
            },
            children: [{
              type: 'paragraph',
              content: `${change.path}: ${JSON.stringify(change.from)} → ${JSON.stringify(change.to)}`,
              style: { margin: 0, fontSize: '9px', color: '#d4d4d4', fontFamily: 'monospace' }
            }]
          }))
        }
      ]
    };
  }
}
