// Inspector UI building
export class InspectorUI {
  constructor(reporting) {
    this.reporting = reporting;
  }

  buildInspectorUI(component) {
    if (!component) {
      return {
        type: 'box',
        style: { padding: '12px', background: '#1e1e1e', borderRadius: '6px' },
        children: [{
          type: 'paragraph',
          content: 'Select a component to inspect',
          style: { margin: 0, fontSize: '11px', color: '#858585' }
        }]
      };
    }

    const report = this.reporting.getInspectionReport(component);

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
          content: '🔍 Component Inspector',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
        },
        this.buildMetricsPanel(report.metrics),
        this.buildAccessibilityPanel(report.accessibility),
        this.buildIssuesPanel(report.issues)
      ]
    };
  }

  buildMetricsPanel(metrics) {
    return {
      type: 'box',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px'
      },
      children: [
        this.buildMetricCard('Total Nodes', metrics.totalNodes),
        this.buildMetricCard('Max Depth', metrics.maxDepth),
        this.buildMetricCard('Styles', metrics.styleProperties)
      ]
    };
  }

  buildMetricCard(label, value) {
    return {
      type: 'box',
      style: { padding: '8px 12px', background: '#2d2d30', borderRadius: '4px' },
      children: [
        {
          type: 'paragraph',
          content: label,
          style: { margin: 0, fontSize: '9px', color: '#858585' }
        },
        {
          type: 'heading',
          content: String(value),
          level: 4,
          style: { margin: '4px 0 0 0', fontSize: '14px', color: '#667eea' }
        }
      ]
    };
  }

  buildAccessibilityPanel(a11y) {
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
          content: `Contrast Ratio: ${a11y.contrastRatio}:1 ${parseFloat(a11y.contrastRatio) >= 4.5 ? '✓' : '✗'}`,
          style: { margin: 0, fontSize: '10px', color: '#d4d4d4' }
        }
      ]
    };
  }

  buildIssuesPanel(issues) {
    return {
      type: 'box',
      style: { display: 'flex', flexDirection: 'column', gap: '4px' },
      children: issues.slice(0, 3).map(issue => ({
        type: 'box',
        style: {
          padding: '6px 8px',
          background: '#3e3e42',
          borderLeft: `3px solid ${issue.severity === 'high' ? '#ef4444' : issue.severity === 'medium' ? '#f59e0b' : '#4ade80'}`,
          borderRadius: '3px'
        },
        children: [{
          type: 'paragraph',
          content: issue.message,
          style: { margin: 0, fontSize: '9px', color: '#d4d4d4' }
        }]
      }))
    };
  }
}
