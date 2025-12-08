class PatternSearchIndex {
  constructor() {
    this.index = new Map();
    this.patterns = new Map();
    this.tokens = new Map();
    this.vocabulary = new Set();
    this.tf = new Map();
    this.idf = new Map();
    this.documentCount = 0;
  }

  addPattern(patternId, pattern) {
    this.patterns.set(patternId, pattern);
    this.indexPattern(patternId, pattern);
    this.updateTFIDF();
  }

  indexPattern(patternId, pattern) {
    const tokens = this.tokenize(pattern);

    tokens.forEach(token => {
      if (!this.index.has(token)) {
        this.index.set(token, new Set());
      }
      this.index.get(token).add(patternId);
      this.vocabulary.add(token);
    });

    if (!this.tokens.has(patternId)) {
      this.tokens.set(patternId, new Set());
    }
    tokens.forEach(token => this.tokens.get(patternId).add(token));

    this.documentCount++;
  }

  tokenize(text) {
    if (typeof text !== 'string') text = JSON.stringify(text);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2 && !this.isStopword(token));
  }

  isStopword(token) {
    const stopwords = ['the', 'and', 'or', 'is', 'are', 'was', 'were', 'be', 'to', 'of', 'in', 'a', 'an', 'for', 'with', 'by', 'on', 'at', 'from', 'as'];
    return stopwords.includes(token);
  }

  updateTFIDF() {
    this.patterns.forEach((pattern, patternId) => {
      const tf = new Map();
      const tokens = this.tokens.get(patternId) || new Set();

      tokens.forEach(token => {
        const count = this.countTokenOccurrences(patternId, token);
        tf.set(token, count / Math.max(tokens.size, 1));
      });

      this.tf.set(patternId, tf);
    });

    this.vocabulary.forEach(token => {
      const docsWithToken = this.index.get(token)?.size || 0;
      const idf = Math.log((this.documentCount + 1) / (docsWithToken + 1));
      this.idf.set(token, idf);
    });
  }

  countTokenOccurrences(patternId, token) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return 0;

    const text = JSON.stringify(pattern).toLowerCase();
    const regex = new RegExp(`\\b${token}\\b`, 'g');
    return (text.match(regex) || []).length;
  }

  search(query, limit = 10) {
    const tokens = this.tokenize(query);
    if (tokens.length === 0) return [];

    const results = new Map();

    tokens.forEach(token => {
      const docsWithToken = this.index.get(token) || new Set();

      docsWithToken.forEach(patternId => {
        if (!results.has(patternId)) {
          results.set(patternId, 0);
        }

        const tf = this.tf.get(patternId)?.get(token) || 0;
        const idf = this.idf.get(token) || 0;
        const score = tf * idf;

        results.set(patternId, results.get(patternId) + score);
      });
    });

    return Array.from(results.entries())
      .map(([patternId, score]) => ({
        patternId,
        pattern: this.patterns.get(patternId),
        score
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  advancedSearch(filters = {}) {
    let results = Array.from(this.patterns.entries()).map(([patternId, pattern]) => ({
      patternId,
      pattern,
      score: 1
    }));

    if (filters.category) {
      results = results.filter(r => r.pattern.category === filters.category);
    }

    if (filters.tags && Array.isArray(filters.tags)) {
      results = results.filter(r => {
        const patternTags = r.pattern.tags || [];
        return filters.tags.some(tag => patternTags.includes(tag));
      });
    }

    if (filters.minCodeReduction !== undefined) {
      results = results.filter(r => (r.pattern.codeReduction || 0) >= filters.minCodeReduction);
    }

    if (filters.query) {
      const queryResults = this.search(filters.query, 1000);
      const queryIds = new Set(queryResults.map(r => r.patternId));
      results = results.filter(r => queryIds.has(r.patternId));

      results.forEach(r => {
        const queryResult = queryResults.find(qr => qr.patternId === r.patternId);
        r.score = queryResult?.score || 0;
      });
    }

    return results.sort((a, b) => b.score - a.score);
  }

  getAutocompleteSuggestions(partial, limit = 5) {
    const suggestions = new Set();

    this.vocabulary.forEach(token => {
      if (token.startsWith(partial.toLowerCase())) {
        suggestions.add(token);
      }
    });

    this.patterns.forEach(pattern => {
      if (pattern.name?.toLowerCase().includes(partial.toLowerCase())) {
        suggestions.add(pattern.name);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  fuzzySearch(query, limit = 10) {
    const results = [];

    this.patterns.forEach((pattern, patternId) => {
      const score = this.calculateFuzzyScore(query, pattern);
      if (score > 0.3) {
        results.push({
          patternId,
          pattern,
          score
        });
      }
    });

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  calculateFuzzyScore(query, pattern) {
    const queryLower = query.toLowerCase();
    const nameLower = (pattern.name || '').toLowerCase();
    const descLower = (pattern.description || '').toLowerCase();

    let score = 0;

    if (nameLower.includes(queryLower)) {
      score += 1;
    } else {
      const similarity = this.levenshteinSimilarity(queryLower, nameLower);
      score += similarity * 0.8;
    }

    if (descLower.includes(queryLower)) {
      score += 0.5;
    }

    const tags = pattern.tags || [];
    const tagMatches = tags.filter(t => t.toLowerCase().includes(queryLower)).length;
    score += (tagMatches / Math.max(tags.length, 1)) * 0.5;

    return Math.min(score, 1);
  }

  levenshteinSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(s1, s2) {
    const costs = [];

    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }

    return costs[s2.length];
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
          content: `Indexed ${this.patterns.size} patterns | ${this.vocabulary.size} tokens`,
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
        patternCount: this.patterns.size,
        tokenCount: this.vocabulary.size,
        documentCount: this.documentCount
      },
      index: Array.from(this.index.entries()).map(([token, docs]) => ({
        token,
        documentCount: docs.size,
        idf: this.idf.get(token) || 0
      }))
    };
  }

  clearIndex() {
    this.index.clear();
    this.patterns.clear();
    this.tokens.clear();
    this.vocabulary.clear();
    this.tf.clear();
    this.idf.clear();
    this.documentCount = 0;
  }
}

function createPatternSearchIndex() {
  return new PatternSearchIndex();
}

export { PatternSearchIndex, createPatternSearchIndex };
