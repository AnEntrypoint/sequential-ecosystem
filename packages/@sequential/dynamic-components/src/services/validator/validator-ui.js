export class ValidatorUI {
  constructor(core) {
    this.core = core;
  }

  buildValidatorUI(results = null) {
    if (!results) {
      return {
        type: 'box',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px',
          backgroundColor: '#f9f9f9',
          borderRadius: '6px'
        },
        children: [
          {
            type: 'heading',
            content: 'Accessibility Validator',
            level: 4,
            style: { margin: 0, fontSize: '14px', fontWeight: 600 }
          },
          {
            type: 'text',
            content: 'Select a pattern to audit for WCAG compliance'
          }
        ]
      };
    }

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px'
      },
      children: [
        this.buildComplianceHeader(results),
        this.buildLevelSelector(),
        this.buildResultsSummary(results),
        this.buildCategoryResults(results)
      ]
    };
  }

  buildComplianceHeader(results) {
    const score = this.core.getComplianceScore(results);

    return {
      type: 'box',
      style: {
        padding: '12px',
        backgroundColor: '#fff',
        borderRadius: '4px',
        border: `2px solid ${score >= 80 ? '#28a745' : score >= 60 ? '#ffc107' : '#dc3545'}`
      },
      children: [
        {
          type: 'heading',
          content: `WCAG ${results.level} Compliance: ${score}%`,
          level: 4,
          style: {
            margin: 0,
            fontSize: '14px',
            fontWeight: 700,
            color: score >= 80 ? '#28a745' : score >= 60 ? '#ffc107' : '#dc3545'
          }
        }
      ]
    };
  }

  buildLevelSelector() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        gap: '8px'
      },
      children: [
        {
          type: 'text',
          content: 'Level:',
          style: { fontSize: '12px', fontWeight: 600, alignSelf: 'center' }
        },
        ...['A', 'AA', 'AAA'].map(level => ({
          type: 'button',
          content: level,
          style: {
            padding: '6px 12px',
            backgroundColor: this.core.selectedLevel === level ? '#667eea' : '#e0e0e0',
            color: this.core.selectedLevel === level ? '#fff' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: this.core.selectedLevel === level ? 600 : 400
          }
        }))
      ]
    };
  }

  buildResultsSummary(results) {
    return {
      type: 'box',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px'
      },
      children: [
        {
          type: 'box',
          style: {
            padding: '10px',
            backgroundColor: '#fff',
            borderRadius: '4px',
            textAlign: 'center'
          },
          children: [
            { type: 'text', content: 'Passed', style: { fontSize: '11px', color: '#666' } },
            { type: 'heading', content: String(results.summary.passed), level: 5, style: { margin: '4px 0 0 0', fontSize: '18px', fontWeight: 700, color: '#28a745' } }
          ]
        },
        {
          type: 'box',
          style: {
            padding: '10px',
            backgroundColor: '#fff',
            borderRadius: '4px',
            textAlign: 'center'
          },
          children: [
            { type: 'text', content: 'Warnings', style: { fontSize: '11px', color: '#666' } },
            { type: 'heading', content: String(results.summary.warnings), level: 5, style: { margin: '4px 0 0 0', fontSize: '18px', fontWeight: 700, color: '#ffc107' } }
          ]
        },
        {
          type: 'box',
          style: {
            padding: '10px',
            backgroundColor: '#fff',
            borderRadius: '4px',
            textAlign: 'center'
          },
          children: [
            { type: 'text', content: 'Failed', style: { fontSize: '11px', color: '#666' } },
            { type: 'heading', content: String(results.summary.failed), level: 5, style: { margin: '4px 0 0 0', fontSize: '18px', fontWeight: 700, color: '#dc3545' } }
          ]
        }
      ]
    };
  }

  buildCategoryResults(results) {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      },
      children: Object.entries(results.categories).map(([category, rules]) => ({
        type: 'box',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        },
        children: [
          {
            type: 'heading',
            content: this.capitalize(category),
            level: 5,
            style: { margin: 0, fontSize: '12px', fontWeight: 600 }
          },
          {
            type: 'box',
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            },
            children: rules.map(rule => ({
              type: 'box',
              style: {
                padding: '8px',
                backgroundColor: '#fff',
                border: `1px solid ${rule.passed ? '#28a74580' : rule.severity === 'error' ? '#dc354580' : '#ffc10780'}`,
                borderRadius: '4px'
              },
              children: [
                {
                  type: 'text',
                  content: `${rule.id} ${rule.title}`,
                  style: { fontWeight: 600, fontSize: '11px', color: rule.passed ? '#28a745' : rule.severity === 'error' ? '#dc3545' : '#ffc107' }
                },
                {
                  type: 'text',
                  content: rule.fix,
                  style: { fontSize: '10px', color: '#666', margin: '4px 0 0 0' }
                }
              ]
            }))
          }
        ]
      }))
    };
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
