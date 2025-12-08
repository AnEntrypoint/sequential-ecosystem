class PatternSuggestionsEngine {
  constructor(patternLibrary = []) {
    this.library = patternLibrary;
    this.usage = new Map();
    this.context = new Map();
    this.suggestions = [];
    this.models = {
      similarity: this.createSimilarityModel(),
      frequency: this.createFrequencyModel(),
      composition: this.createCompositionModel()
    };
  }

  registerPattern(patternId, metadata) {
    if (!this.usage.has(patternId)) {
      this.usage.set(patternId, {
        id: patternId,
        count: 0,
        lastUsed: null,
        tags: metadata.tags || [],
        category: metadata.category || 'general',
        description: metadata.description || '',
        dependencies: metadata.dependencies || []
      });
    }
  }

  recordUsage(patternId, context = {}) {
    const usage = this.usage.get(patternId);
    if (usage) {
      usage.count++;
      usage.lastUsed = Date.now();
      usage.context = context;
    }
  }

  suggestPatterns(query, context = {}, limit = 5) {
    const scored = this.library.map(pattern => ({
      ...pattern,
      score: this.calculateScore(pattern, query, context)
    }));

    const sorted = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return sorted.map((p, idx) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      score: p.score,
      rank: idx + 1,
      reasoning: this.generateReasoning(p, query, context),
      tags: p.tags,
      codeReduction: p.codeReduction
    }));
  }

  calculateScore(pattern, query, context) {
    let score = 0;

    const textScore = this.calculateTextSimilarity(query, pattern);
    score += textScore * 0.4;

    const usagePattern = this.usage.get(pattern.id);
    const frequencyScore = usagePattern ? Math.min(usagePattern.count / 100, 1) : 0;
    score += frequencyScore * 0.2;

    const contextScore = this.calculateContextRelevance(pattern, context);
    score += contextScore * 0.3;

    const recencyScore = this.calculateRecencyScore(pattern);
    score += recencyScore * 0.1;

    return score;
  }

  calculateTextSimilarity(query, pattern) {
    if (!query) return 0.5;

    const queryLower = query.toLowerCase();
    const nameMatch = pattern.name?.toLowerCase().includes(queryLower) ? 1 : 0;
    const descMatch = pattern.description?.toLowerCase().includes(queryLower) ? 0.7 : 0;
    const tagsMatch = pattern.tags?.some(t => t.toLowerCase().includes(queryLower)) ? 0.8 : 0;

    return Math.max(nameMatch, descMatch, tagsMatch);
  }

  calculateContextRelevance(pattern, context) {
    if (!context || Object.keys(context).length === 0) return 0.5;

    let relevance = 0;

    if (context.category && pattern.category === context.category) {
      relevance += 0.4;
    }

    if (context.tags && Array.isArray(context.tags)) {
      const tagMatches = pattern.tags?.filter(t => context.tags.includes(t)).length || 0;
      relevance += Math.min(tagMatches / Math.max(context.tags.length, 1), 0.4);
    }

    if (context.codeReduction && pattern.codeReduction) {
      const reductionRatio = Math.min(pattern.codeReduction / (context.codeReduction + 1), 0.2);
      relevance += reductionRatio;
    }

    return Math.min(relevance, 1);
  }

  calculateRecencyScore(pattern) {
    const usage = this.usage.get(pattern.id);
    if (!usage || !usage.lastUsed) return 0;

    const ageMs = Date.now() - usage.lastUsed;
    const daysSinceUse = ageMs / (1000 * 60 * 60 * 24);

    if (daysSinceUse < 1) return 1;
    if (daysSinceUse < 7) return 0.8;
    if (daysSinceUse < 30) return 0.5;
    return 0.1;
  }

  generateReasoning(pattern, query, context) {
    const reasons = [];

    if (query && pattern.name?.toLowerCase().includes(query.toLowerCase())) {
      reasons.push(`Matches query "${query}"`);
    }

    if (context.category && pattern.category === context.category) {
      reasons.push(`Same category: ${context.category}`);
    }

    const usage = this.usage.get(pattern.id);
    if (usage && usage.count > 5) {
      reasons.push(`Popular (${usage.count} uses)`);
    }

    if (pattern.codeReduction) {
      reasons.push(`Reduces ${pattern.codeReduction} lines of code`);
    }

    return reasons.length > 0 ? reasons : ['Good overall match'];
  }

  suggestCompositions(patterns, limit = 3) {
    const compositions = [];

    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const p1 = patterns[i];
        const p2 = patterns[j];
        const compatibility = this.calculateCompatibility(p1, p2);

        if (compatibility.score > 0.6) {
          compositions.push({
            patterns: [p1.id, p2.id],
            score: compatibility.score,
            reason: compatibility.reason,
            layout: compatibility.suggestedLayout
          });
        }
      }
    }

    return compositions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  calculateCompatibility(p1, p2) {
    let score = 0;
    const reasons = [];

    if (p1.category === p2.category) {
      score += 0.3;
      reasons.push('Same category');
    }

    const commonTags = (p1.tags || []).filter(t => (p2.tags || []).includes(t));
    if (commonTags.length > 0) {
      score += Math.min(commonTags.length / 5, 0.3);
      reasons.push(`Share tags: ${commonTags.join(', ')}`);
    }

    if (!p1.dependencies?.includes(p2.id) && !p2.dependencies?.includes(p1.id)) {
      score += 0.2;
      reasons.push('No circular dependencies');
    }

    const layout = this.suggestLayout(p1, p2);
    return {
      score: Math.min(score, 1),
      reason: reasons.join('; '),
      suggestedLayout: layout
    };
  }

  suggestLayout(p1, p2) {
    if (p1.category === 'header' && p2.category === 'content') return 'vertical';
    if (p1.category === 'sidebar' && p2.category === 'content') return 'horizontal';
    if (p1.category === 'button' && p2.category === 'button') return 'horizontal';
    return 'vertical';
  }

  suggestNextPatterns(currentPatternId, limit = 3) {
    const current = this.library.find(p => p.id === currentPatternId);
    if (!current) return [];

    const candidates = this.library.filter(p => p.id !== currentPatternId);
    const suggestions = [];

    candidates.forEach(candidate => {
      const compatibility = this.calculateCompatibility(current, candidate);
      if (compatibility.score > 0.5) {
        suggestions.push({
          id: candidate.id,
          name: candidate.name,
          score: compatibility.score,
          reason: compatibility.reason,
          layout: compatibility.suggestedLayout
        });
      }
    });

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  createSimilarityModel() {
    return {
      compare: (a, b) => this.calculateTextSimilarity(a, b),
      threshold: 0.5
    };
  }

  createFrequencyModel() {
    return {
      getFrequency: (patternId) => {
        const usage = this.usage.get(patternId);
        return usage ? usage.count : 0;
      },
      getRanking: () => {
        return Array.from(this.usage.values())
          .sort((a, b) => b.count - a.count);
      }
    };
  }

  createCompositionModel() {
    return {
      findPatterns: (context) => this.suggestPatterns('', context),
      suggestCompositions: (patterns) => this.suggestCompositions(patterns)
    };
  }

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

function createPatternSuggestionsEngine(library) {
  return new PatternSuggestionsEngine(library);
}

export { PatternSuggestionsEngine, createPatternSuggestionsEngine };
