class PatternSuggestionsUI {
  constructor(suggestionsEngine) {
    this.engine = suggestionsEngine;
    this.currentQuery = '';
    this.currentContext = {};
    this.selectedSuggestion = null;
    this.viewMode = 'suggestions';
    this.searchHistory = [];
  }

  buildSuggestionsPanel(query = '', context = {}) {
    const suggestions = this.engine.suggestPatterns(query, context, 8);
    this.currentQuery = query;
    this.currentContext = context;

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
        this.buildSearchBar(),
        this.buildContextFilters(context),
        this.buildSuggestionsGrid(suggestions),
        suggestions.length === 0 ? {
          type: 'paragraph',
          content: 'No suggestions found. Try a different query or context.',
          style: {
            margin: 0,
            fontSize: '10px',
            color: '#858585',
            textAlign: 'center',
            padding: '20px'
          }
        } : null
      ].filter(Boolean)
    };
  }

  buildSearchBar() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        gap: '8px',
        marginBottom: '8px'
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
    };
  }

  buildContextFilters(context) {
    return {
      type: 'box',
      style: {
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap'
      },
      children: [
        context.category ? {
          type: 'box',
          style: {
            padding: '4px 8px',
            background: '#667eea',
            borderRadius: '3px',
            fontSize: '9px',
            color: '#fff'
          },
          children: [{
            type: 'paragraph',
            content: `Category: ${context.category}`,
            style: { margin: 0 }
          }]
        } : null,
        context.tags?.map(tag => ({
          type: 'box',
          style: {
            padding: '4px 8px',
            background: '#3e3e42',
            borderRadius: '3px',
            fontSize: '9px',
            color: '#d4d4d4'
          },
          children: [{
            type: 'paragraph',
            content: `#${tag}`,
            style: { margin: 0 }
          }]
        })) || []
      ].filter(Boolean)
    };
  }

  buildSuggestionsGrid(suggestions) {
    return {
      type: 'box',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px'
      },
      children: suggestions.map((sug, idx) => this.buildSuggestionCard(sug, idx))
    };
  }

  buildSuggestionCard(suggestion, index) {
    const scoreColor = this.engine.getScoreColor(suggestion.score);

    return {
      type: 'box',
      style: {
        padding: '10px',
        background: '#2d2d30',
        borderRadius: '4px',
        border: `1px solid ${scoreColor}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      },
      children: [
        {
          type: 'box',
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            marginBottom: '6px'
          },
          children: [
            {
              type: 'heading',
              content: suggestion.name,
              level: 5,
              style: {
                margin: 0,
                fontSize: '11px',
                color: '#d4d4d4',
                fontWeight: 600,
                flex: 1,
                wordBreak: 'break-word'
              }
            },
            {
              type: 'box',
              style: {
                padding: '2px 6px',
                background: scoreColor,
                borderRadius: '2px',
                minWidth: '35px',
                textAlign: 'center',
                marginLeft: '6px'
              },
              children: [{
                type: 'paragraph',
                content: `${(suggestion.score * 100).toFixed(0)}%`,
                style: {
                  margin: 0,
                  fontSize: '9px',
                  color: '#fff',
                  fontWeight: 600
                }
              }]
            }
          ]
        },
        {
          type: 'paragraph',
          content: suggestion.description,
          style: {
            margin: '0 0 6px 0',
            fontSize: '9px',
            color: '#858585',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }
        },
        suggestion.tags?.length > 0 ? {
          type: 'box',
          style: {
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
            marginBottom: '6px'
          },
          children: suggestion.tags.slice(0, 3).map(tag => ({
            type: 'box',
            style: {
              padding: '2px 4px',
              background: '#3e3e42',
              borderRadius: '2px'
            },
            children: [{
              type: 'paragraph',
              content: tag,
              style: {
                margin: 0,
                fontSize: '8px',
                color: '#858585'
              }
            }]
          }))
        } : null,
        {
          type: 'paragraph',
          content: `💡 ${suggestion.reasoning[0] || 'Good match'}`,
          style: {
            margin: 0,
            fontSize: '8px',
            color: '#667eea',
            fontStyle: 'italic'
          }
        }
      ].filter(Boolean)
    };
  }

  buildCompositionSuggestions(patterns) {
    const compositions = this.engine.suggestCompositions(patterns, 5);

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
          content: '🎨 Suggested Compositions',
          level: 3,
          style: {
            margin: 0,
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        ...compositions.map((comp, idx) => ({
          type: 'box',
          style: {
            padding: '10px 12px',
            background: '#2d2d30',
            borderRadius: '4px',
            borderLeft: `3px solid ${this.engine.getScoreColor(comp.score)}`
          },
          children: [
            {
              type: 'box',
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              },
              children: [
                {
                  type: 'paragraph',
                  content: `Composition ${idx + 1}`,
                  style: {
                    margin: 0,
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#d4d4d4'
                  }
                },
                {
                  type: 'paragraph',
                  content: `${(comp.score * 100).toFixed(0)}%`,
                  style: {
                    margin: 0,
                    fontSize: '9px',
                    color: this.engine.getScoreColor(comp.score)
                  }
                }
              ]
            },
            {
              type: 'paragraph',
              content: `${comp.patterns.join(' + ')}`,
              style: {
                margin: '0 0 4px 0',
                fontSize: '10px',
                color: '#667eea',
                fontFamily: 'monospace'
              }
            },
            {
              type: 'paragraph',
              content: `Layout: ${comp.layout} | ${comp.reason}`,
              style: {
                margin: 0,
                fontSize: '9px',
                color: '#858585'
              }
            }
          ]
        })),
        compositions.length === 0 ? {
          type: 'paragraph',
          content: 'No compatible compositions found',
          style: {
            margin: 0,
            fontSize: '10px',
            color: '#858585',
            textAlign: 'center',
            padding: '12px'
          }
        } : null
      ].filter(Boolean)
    };
  }

  buildNextPatternsSuggestions(currentPatternId) {
    const suggestions = this.engine.suggestNextPatterns(currentPatternId, 4);

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        background: '#2d2d30',
        borderRadius: '4px',
        borderLeft: '3px solid #667eea'
      },
      children: [
        {
          type: 'heading',
          content: '➕ What to use next?',
          level: 4,
          style: {
            margin: 0,
            fontSize: '11px',
            color: '#667eea',
            textTransform: 'uppercase'
          }
        },
        ...suggestions.map((sug, idx) => ({
          type: 'box',
          style: {
            padding: '6px 8px',
            background: '#3e3e42',
            borderRadius: '3px'
          },
          children: [
            {
              type: 'paragraph',
              content: `${idx + 1}. ${sug.name} (${(sug.score * 100).toFixed(0)}%)`,
              style: {
                margin: 0,
                fontSize: '10px',
                color: '#d4d4d4'
              }
            },
            {
              type: 'paragraph',
              content: `${sug.reason} • ${sug.layout} layout`,
              style: {
                margin: '2px 0 0 0',
                fontSize: '8px',
                color: '#858585'
              }
            }
          ]
        })),
        suggestions.length === 0 ? {
          type: 'paragraph',
          content: 'No recommendations',
          style: {
            margin: 0,
            fontSize: '9px',
            color: '#858585'
          }
        } : null
      ].filter(Boolean)
    };
  }

  buildDetailView(suggestion) {
    return {
      type: 'box',
      style: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#1e1e1e',
        borderRadius: '6px',
        border: `1px solid ${this.engine.getScoreColor(suggestion.score)}`,
        padding: '20px',
        zIndex: 10000,
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      },
      children: [
        {
          type: 'heading',
          content: suggestion.name,
          level: 2,
          style: {
            margin: '0 0 12px 0',
            color: '#e0e0e0'
          }
        },
        {
          type: 'box',
          style: {
            padding: '8px 12px',
            background: '#2d2d30',
            borderRadius: '4px',
            marginBottom: '12px'
          },
          children: [{
            type: 'paragraph',
            content: `Match Score: ${(suggestion.score * 100).toFixed(0)}%`,
            style: {
              margin: 0,
              fontSize: '11px',
              color: this.engine.getScoreColor(suggestion.score),
              fontWeight: 600
            }
          }]
        },
        {
          type: 'paragraph',
          content: suggestion.description,
          style: {
            margin: '0 0 12px 0',
            fontSize: '11px',
            color: '#d4d4d4',
            lineHeight: '1.5'
          }
        },
        suggestion.tags?.length > 0 ? {
          type: 'box',
          style: {
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            marginBottom: '12px'
          },
          children: suggestion.tags.map(tag => ({
            type: 'box',
            style: {
              padding: '4px 8px',
              background: '#3e3e42',
              borderRadius: '3px'
            },
            children: [{
              type: 'paragraph',
              content: tag,
              style: {
                margin: 0,
                fontSize: '9px',
                color: '#d4d4d4'
              }
            }]
          }))
        } : null,
        {
          type: 'box',
          style: {
            paddingTop: '12px',
            borderTop: '1px solid #3e3e42'
          },
          children: [
            {
              type: 'heading',
              content: 'Why this suggestion?',
              level: 4,
              style: {
                margin: '0 0 8px 0',
                fontSize: '11px',
                color: '#e0e0e0'
              }
            },
            {
              type: 'box',
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              },
              children: suggestion.reasoning.map(reason => ({
                type: 'box',
                style: {
                  padding: '4px 8px',
                  background: '#2d2d30',
                  borderRadius: '3px'
                },
                children: [{
                  type: 'paragraph',
                  content: `✓ ${reason}`,
                  style: {
                    margin: 0,
                    fontSize: '9px',
                    color: '#4ade80'
                  }
                }]
              }))
            }
          ]
        }
      ].filter(Boolean)
    };
  }
}

function createPatternSuggestionsUI(suggestionsEngine) {
  return new PatternSuggestionsUI(suggestionsEngine);
}

export { PatternSuggestionsUI, createPatternSuggestionsUI };
