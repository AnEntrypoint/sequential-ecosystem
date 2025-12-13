// Search algorithms: TF-IDF, advanced, and autocomplete
export class SearchEngine {
  constructor(index) {
    this.index = index;
  }

  search(query, limit = 10) {
    const tokens = this.index.tokenize(query);
    if (tokens.length === 0) return [];

    const results = new Map();

    tokens.forEach(token => {
      const docsWithToken = this.index.index.get(token) || new Set();

      docsWithToken.forEach(patternId => {
        if (!results.has(patternId)) {
          results.set(patternId, 0);
        }

        const tf = this.index.tf.get(patternId)?.get(token) || 0;
        const idf = this.index.idf.get(token) || 0;
        const score = tf * idf;

        results.set(patternId, results.get(patternId) + score);
      });
    });

    return Array.from(results.entries())
      .map(([patternId, score]) => ({
        patternId,
        pattern: this.index.patterns.get(patternId),
        score
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  advancedSearch(filters = {}) {
    let results = Array.from(this.index.patterns.entries()).map(([patternId, pattern]) => ({
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

    this.index.vocabulary.forEach(token => {
      if (token.startsWith(partial.toLowerCase())) {
        suggestions.add(token);
      }
    });

    this.index.patterns.forEach(pattern => {
      if (pattern.name?.toLowerCase().includes(partial.toLowerCase())) {
        suggestions.add(pattern.name);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }
}
