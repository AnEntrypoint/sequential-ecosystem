// Pattern integration UI panel builders
export class PatternIntegrationPanels {
  constructor(discovery, selectedPattern, insertedPatterns) {
    this.discovery = discovery;
    this.selectedPattern = selectedPattern;
    this.insertedPatterns = insertedPatterns;
  }

  buildPatternSearchPanel() {
    return {
      type: 'flex',
      direction: 'column',
      gap: '16px',
      style: {
        padding: '16px',
        background: '#f9f9f9',
        borderRight: '1px solid #e0e0e0',
        height: '100%',
        overflowY: 'auto',
        width: '300px'
      },
      children: [
        {
          type: 'heading',
          content: 'Pattern Library',
          level: 3,
          style: { margin: '0 0 12px 0', fontSize: '16px' }
        },
        {
          type: 'flex',
          direction: 'row',
          gap: '8px',
          style: { alignItems: 'center', marginBottom: '12px' },
          children: [
            {
              type: 'paragraph',
              content: '🔍',
              style: { margin: 0, fontSize: '16px' }
            },
            {
              type: 'input',
              placeholder: 'Search patterns...',
              style: {
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px'
              }
            }
          ]
        },
        {
          type: 'flex',
          direction: 'column',
          gap: '8px',
          children: [
            {
              type: 'paragraph',
              content: 'Categories',
              style: { margin: 0, fontSize: '12px', fontWeight: '600', color: '#666' }
            },
            ...this.discovery.getCategories().map(cat => ({
              type: 'button',
              label: `${cat} (${this.discovery.filterByCategory(cat).length})`,
              variant: 'secondary',
              style: {
                width: '100%',
                padding: '8px 12px',
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '12px'
              }
            }))
          ]
        },
        {
          type: 'flex',
          direction: 'column',
          gap: '8px',
          style: { marginTop: '12px' },
          children: [
            {
              type: 'paragraph',
              content: 'Popular Tags',
              style: { margin: 0, fontSize: '12px', fontWeight: '600', color: '#666' }
            },
            {
              type: 'flex',
              direction: 'row',
              gap: '6px',
              style: { flexWrap: 'wrap' },
              children: this.discovery.getMostCommonTags(6).map(({ tag }) => ({
                type: 'button',
                label: tag,
                variant: 'secondary',
                style: {
                  padding: '6px 10px',
                  background: '#e8f5e9',
                  border: '1px solid #81c784',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: '#2e7d32'
                }
              }))
            }
          ]
        }
      ]
    };
  }

  buildPatternPreviewPanel() {
    if (!this.selectedPattern) {
      return {
        type: 'flex',
        direction: 'column',
        gap: '16px',
        style: { padding: '20px', background: '#fff', textAlign: 'center' },
        children: [
          {
            type: 'paragraph',
            content: 'Select a pattern to preview',
            style: { margin: 0, fontSize: '14px', color: '#999' }
          }
        ]
      };
    }

    return {
      type: 'flex',
      direction: 'column',
      gap: '12px',
      style: {
        padding: '16px',
        background: '#fff',
        borderLeft: '1px solid #e0e0e0'
      },
      children: [
        {
          type: 'heading',
          content: this.selectedPattern.name,
          level: 3,
          style: { margin: 0, fontSize: '16px' }
        },
        {
          type: 'paragraph',
          content: this.selectedPattern.description,
          style: { margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.5' }
        },
        {
          type: 'flex',
          direction: 'row',
          gap: '12px',
          style: { flexWrap: 'wrap', marginTop: '8px' },
          children: this.selectedPattern.tags.map(tag => ({
            type: 'box',
            style: {
              padding: '4px 8px',
              background: '#e3f2fd',
              color: '#0078d4',
              borderRadius: '4px',
              fontSize: '11px'
            },
            children: [{ type: 'paragraph', content: tag, style: { margin: 0 } }]
          }))
        },
        {
          type: 'flex',
          direction: 'row',
          gap: '8px',
          style: { marginTop: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' },
          children: [
            {
              type: 'paragraph',
              content: `Code Reduction: ${this.selectedPattern.codeReduction}`,
              style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#2e7d32' }
            }
          ]
        },
        {
          type: 'button',
          label: '+ Insert Pattern',
          variant: 'primary',
          style: {
            width: '100%',
            padding: '10px 16px',
            background: '#0078d4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            marginTop: '12px'
          }
        }
      ]
    };
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
        ...this.insertedPatterns.map((insertion) => ({
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
        }))
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
            {
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
                  content: 'Total Patterns',
                  style: { margin: 0, fontSize: '13px', color: '#666' }
                },
                {
                  type: 'paragraph',
                  content: stats.totalPatterns.toString(),
                  style: { margin: 0, fontSize: '13px', fontWeight: '600' }
                }
              ]
            },
            {
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
                  content: 'Categories',
                  style: { margin: 0, fontSize: '13px', color: '#666' }
                },
                {
                  type: 'paragraph',
                  content: stats.categories.toString(),
                  style: { margin: 0, fontSize: '13px', fontWeight: '600' }
                }
              ]
            },
            {
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
                  content: 'Avg Code Reduction',
                  style: { margin: 0, fontSize: '13px', color: '#666' }
                },
                {
                  type: 'paragraph',
                  content: `${stats.averageCodeReduction}%`,
                  style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#2e7d32' }
                }
              ]
            }
          ]
        }
      ]
    };
  }
}
