// Accessibility audit UI and reporting
export class A11yReporter {
  constructor(utils) {
    this.utils = utils;
  }

  buildAuditUI(issues) {
    const report = this.utils.buildAuditReport(issues);
    const counts = report.bySeverity;

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
          content: '♿ Accessibility Audit',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
        },
        {
          type: 'box',
          style: {
            padding: '8px 12px',
            background: '#2d2d30',
            borderRadius: '4px',
            borderLeft: `3px solid ${report.wcagLevel === 'Compliant' ? '#4ade80' : '#ef4444'}`
          },
          children: [{
            type: 'paragraph',
            content: `WCAG Level: ${report.wcagLevel}`,
            style: { margin: 0, fontSize: '10px', color: '#d4d4d4' }
          }]
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px'
          },
          children: [
            this.buildIssueCard('Errors', counts.error, '#ef4444'),
            this.buildIssueCard('Warnings', counts.warning, '#f59e0b'),
            this.buildIssueCard('Info', counts.info, '#3b82f6')
          ]
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxHeight: '200px',
            overflow: 'auto'
          },
          children: report.issues.slice(0, 5).map(issue => ({
            type: 'box',
            style: {
              padding: '6px 8px',
              background: '#3e3e42',
              borderLeft: `3px solid ${issue.severity === 'error' ? '#ef4444' : '#f59e0b'}`,
              borderRadius: '3px'
            },
            children: [{
              type: 'paragraph',
              content: `${issue.type}: ${issue.message}`,
              style: { margin: 0, fontSize: '8px', color: '#d4d4d4' }
            }]
          }))
        }
      ]
    };
  }

  buildIssueCard(label, count, color) {
    return {
      type: 'box',
      style: {
        padding: '8px 12px',
        background: '#2d2d30',
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
          content: String(count),
          level: 4,
          style: { margin: '4px 0 0 0', fontSize: '16px', color, fontWeight: 600 }
        }
      ]
    };
  }

  exportAuditReport(componentIssues, wcagGuidelines) {
    const issues = Array.from(componentIssues.values()).flatMap(c => c.issues);
    const report = this.utils.buildAuditReport(issues);

    return {
      generated: new Date().toISOString(),
      report,
      guidelines: Array.from(wcagGuidelines.entries()).map(([code, info]) => ({
        code,
        ...info
      }))
    };
  }
}
