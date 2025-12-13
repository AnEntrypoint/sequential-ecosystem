// Search UI and export functionality
export class SearchUI {
  constructor(index) {
    this.index = index;
  }

  buildSearchUI() {
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
          content: '🔍 Pattern Search',
          level: 3,
          style: {
            margin: 0,
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            gap: '8px'
          },
          children: [
            {
              type: 'box',
              style: {
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: '#2d2d30',
                borderRadius: '4px',
                border: '1px solid #3e3e42'
              },
              children: [{
                type: 'paragraph',
                content: '🔍',
                style: { margin: 0, fontSize: '12px' }
              }]
            }
          ]
        },
        {
          type: 'paragraph',
          content: `Indexed ${this.index.patterns.size} patterns | ${this.index.vocabulary.size} tokens`,
          style: {
            margin: 0,
            fontSize: '9px',
            color: '#858585'
          }
        }
      ]
    };
  }

  exportIndex() {
    return {
      generated: new Date().toISOString(),
      statistics: {
        patternCount: this.index.patterns.size,
        tokenCount: this.index.vocabulary.size,
        documentCount: this.index.documentCount
      },
      index: Array.from(this.index.index.entries()).map(([token, docs]) => ({
        token,
        documentCount: docs.size,
        idf: this.index.idf.get(token) || 0
      }))
    };
  }
}
