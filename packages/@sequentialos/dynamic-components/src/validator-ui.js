// Validator UI building
export class ValidatorUI {
  constructor(engine) {
    this.engine = engine;
  }

  buildValidationUI() {
    const report = this.engine.validationResults.length > 0
      ? this.engine.getValidationReport({}, this.engine.validationResults)
      : null;

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
          content: '✅ Validation',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
        },
        report ? {
          type: 'box',
          style: {
            display: 'flex',
            gap: '12px'
          },
          children: [
            this.buildStatusCard('Errors', report.errors, report.errors === 0 ? '#4ade80' : '#ef4444'),
            this.buildStatusCard('Warnings', report.warnings, report.warnings === 0 ? '#4ade80' : '#f59e0b')
          ]
        } : {
          type: 'paragraph',
          content: 'No validation performed',
          style: { margin: 0, fontSize: '10px', color: '#858585' }
        },
        report && report.details.length > 0 ? {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          },
          children: report.details.slice(0, 3).map(detail => ({
            type: 'box',
            style: {
              padding: '6px 8px',
              background: '#3e3e42',
              borderLeft: `3px solid ${detail.valid ? '#4ade80' : '#ef4444'}`,
              borderRadius: '3px'
            },
            children: [{
              type: 'paragraph',
              content: `${detail.rule}: ${detail.message}`,
              style: { margin: 0, fontSize: '8px', color: '#d4d4d4' }
            }]
          }))
        } : null
      ].filter(Boolean)
    };
  }

  buildStatusCard(label, count, color) {
    return {
      type: 'box',
      style: {
        flex: 1,
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
}
