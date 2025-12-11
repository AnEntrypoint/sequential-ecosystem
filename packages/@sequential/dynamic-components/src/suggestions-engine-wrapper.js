// Suggestions engine wrapper and query handling
export class SuggestionsEngineWrapper {
  constructor(engine) {
    this.engine = engine;
    this.searchHistory = [];
    this.currentQuery = '';
    this.currentContext = {};
  }

  suggestPatterns(query, context = {}, limit = 8) {
    this.currentQuery = query;
    this.currentContext = context;
    this.addToHistory(query);
    return this.engine.suggestPatterns(query, context, limit);
  }

  addToHistory(query) {
    if (!this.searchHistory.includes(query)) {
      this.searchHistory.push(query);
      if (this.searchHistory.length > 20) {
        this.searchHistory.shift();
      }
    }
  }

  getHistory() {
    return [...this.searchHistory];
  }

  clearHistory() {
    this.searchHistory = [];
  }

  searchByTag(tag, limit = 5) {
    return this.engine.suggestPatterns(`tag:${tag}`, {}, limit);
  }

  searchByCategory(category, limit = 5) {
    return this.engine.suggestPatterns(`category:${category}`, {}, limit);
  }

  getRecentSuggestions(limit = 5) {
    return this.suggestPatterns(this.currentQuery, this.currentContext, limit);
  }

  getSuggestedByContext(context, limit = 5) {
    return this.suggestPatterns('', context, limit);
  }

  filterSuggestions(suggestions, filter) {
    if (filter.minRating) {
      suggestions = suggestions.filter(s => (s.rating || 0) >= filter.minRating);
    }
    if (filter.tags) {
      suggestions = suggestions.filter(s => s.tags?.some(t => filter.tags.includes(t)));
    }
    if (filter.category) {
      suggestions = suggestions.filter(s => s.category === filter.category);
    }
    return suggestions;
  }
}
