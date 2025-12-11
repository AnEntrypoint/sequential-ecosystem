// Suggestions UI building and export
export class SuggestionsUIBuilder {
  buildSuggestionsUI(suggestions) {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '💡 Suggested Patterns',
          level: 3,
          style: {
            margin: 0,
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        ...suggestions.map((sug, idx) => ({
          type: 'box',
          style: {
            padding: '8px 12px',
            background: '#2d2d30',
            borderRadius: '4px',
            borderLeft: `3px solid ${this.getScoreColor(sug.score)}`,
            cursor: 'pointer'
          },
          children: [
            {
              type: 'box',
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '4px'
              },
              children: [
                {
                  type: 'paragraph',
                  content: `${idx + 1}. ${sug.name}`,
                  style: {
                    margin: 0,
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#d4d4d4'
                  }
                },
                {
                  type: 'paragraph',
                  content: `${(sug.score * 100).toFixed(0)}%`,
                  style: {
                    margin: 0,
                    fontSize: '10px',
                    color: this.getScoreColor(sug.score),
                    fontWeight: 500
                  }
                }
              ]
            },
            {
              type: 'paragraph',
              content: sug.description,
              style: {
                margin: '0 0 4px 0',
                fontSize: '9px',
                color: '#858585',
                height: '2em',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }
            },
            {
              type: 'paragraph',
              content: `Reasons: ${sug.reasoning.join(', ')}`,
              style: {
                margin: 0,
                fontSize: '8px',
                color: '#667eea',
                fontStyle: 'italic'
              }
            }
          ]
        }))
      ]
    };
  }

  getScoreColor(score) {
    if (score > 0.8) return '#4ade80';
    if (score > 0.6) return '#667eea';
    if (score > 0.4) return '#f59e0b';
    return '#ef4444';
  }

  exportSuggestions(suggestions) {
    return {
      generated: new Date().toISOString(),
      totalSuggestions: suggestions.length,
      suggestions: suggestions.map(s => ({
        id: s.id,
        name: s.name,
        score: s.score,
        reasoning: s.reasoning
      }))
    };
  }
}
