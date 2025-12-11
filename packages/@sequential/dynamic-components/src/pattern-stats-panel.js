// Pattern statistics and management panels
export class PatternStatsPanel {
  constructor(discovery, insertedPatterns) {
    this.discovery = discovery;
    this.insertedPatterns = insertedPatterns;
  }

  buildInsertedPatternsPanel() {
    return {
      type: 'flex',
      direction: 'column',
      gap: '12px',
      style: { padding: '16px', background: '#fff' },
      children: [
        {
          type: 'heading',
          content: 'Inserted Patterns',
          level: 3,
          style: { margin: 0, fontSize: '16px' }
        },
        {
          type: 'paragraph',
          content: `${this.insertedPatterns.length} pattern${this.insertedPatterns.length !== 1 ? 's' : ''} inserted`,
          style: { margin: '0 0 12px 0', fontSize: '13px', color: '#666' }
        },
        ...this.insertedPatterns.map((insertion) => this.buildInsertionItem(insertion))
      ]
    };
  }

  buildInsertionItem(insertion) {
    return {
      type: 'flex',
      direction: 'row',
      gap: '12px',
      style: {
        padding: '12px',
        background: '#f9f9f9',
        borderRadius: '6px',
        border: '1px solid #e0e0e0',
        alignItems: 'center'
      },
      children: [
        {
          type: 'flex',
          direction: 'column',
          gap: '4px',
          style: { flex: 1 },
          children: [
            {
              type: 'paragraph',
              content: insertion.pattern.name,
              style: { margin: 0, fontSize: '13px', fontWeight: '600' }
            },
            {
              type: 'paragraph',
              content: insertion.pattern.category,
              style: { margin: 0, fontSize: '12px', color: '#999' }
            }
          ]
        },
        {
          type: 'button',
          label: '✕',
          variant: 'secondary',
          style: {
            padding: '6px 10px',
            background: '#ffebee',
            color: '#c62828',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }
        }
      ]
    };
  }

  buildStatisticsPanel() {
    const stats = this.discovery.getPatternStats();
    return {
      type: 'flex',
      direction: 'column',
      gap: '16px',
      style: { padding: '16px', background: '#fff' },
      children: [
        {
          type: 'heading',
          content: 'Pattern Statistics',
          level: 3,
          style: { margin: 0, fontSize: '16px' }
        },
        {
          type: 'flex',
          direction: 'column',
          gap: '8px',
          children: [
            this.buildStatRow('Total Patterns', stats.totalPatterns.toString()),
            this.buildStatRow('Categories', stats.categories.toString()),
            this.buildStatRow('Avg Code Reduction', `${stats.averageCodeReduction}%`, true)
          ]
        }
      ]
    };
  }

  buildStatRow(label, value, isHighlight = false) {
    return {
      type: 'flex',
      direction: 'row',
      justifyContent: 'space-between',
      style: {
        padding: '8px 12px',
        background: '#f5f5f5',
        borderRadius: '4px'
      },
      children: [
        {
          type: 'paragraph',
          content: label,
          style: { margin: 0, fontSize: '13px', color: '#666' }
        },
        {
          type: 'paragraph',
          content: value,
          style: {
            margin: 0,
            fontSize: '13px',
            fontWeight: '600',
            color: isHighlight ? '#2e7d32' : undefined
          }
        }
      ]
    };
  }
}
