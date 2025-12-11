// Facade maintaining 100% backward compatibility
import { SuggestionsEngineWrapper } from './suggestions-engine-wrapper.js';
import { SuggestionsUIComponents } from './suggestions-ui-components.js';

class PatternSuggestionsUI {
  constructor(suggestionsEngine) {
    this.engine = new SuggestionsEngineWrapper(suggestionsEngine);
    this.uiBuilder = new SuggestionsUIComponents();
    this.selectedSuggestion = null;
    this.viewMode = 'suggestions';
    this.onSelectionChange = null;
  }

  // Engine methods (delegated to engine)
  suggestPatterns(query, context, limit) {
    return this.engine.suggestPatterns(query, context, limit);
  }

  searchByTag(tag, limit) {
    return this.engine.searchByTag(tag, limit);
  }

  searchByCategory(category, limit) {
    return this.engine.searchByCategory(category, limit);
  }

  getRecentSuggestions(limit) {
    return this.engine.getRecentSuggestions(limit);
  }

  getSuggestedByContext(context, limit) {
    return this.engine.getSuggestedByContext(context, limit);
  }

  filterSuggestions(suggestions, filter) {
    return this.engine.filterSuggestions(suggestions, filter);
  }

  getSearchHistory() {
    return this.engine.getHistory();
  }

  clearSearchHistory() {
    return this.engine.clearHistory();
  }

  // UI methods (delegated to uiBuilder)
  buildSuggestionsPanel(query = '', context = {}) {
    const suggestions = this.suggestPatterns(query, context, 8);
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
        this.buildSearchBar(query),
        this.buildContextFilters(context),
        suggestions.length > 0 ? this.buildSuggestionsGrid(suggestions) : this.buildEmptyState()
      ].filter(Boolean)
    };
  }

  buildSearchBar(query) {
    return this.uiBuilder.buildSearchBar((q) => this.engine.suggestPatterns(q, this.engine.currentContext, 8), query);
  }

  buildContextFilters(context) {
    return this.uiBuilder.buildContextFilters(context, (key) => this.removeFilter(key));
  }

  buildSuggestionsGrid(suggestions) {
    return this.uiBuilder.buildSuggestionsGrid(suggestions, (sugg) => this.selectSuggestion(sugg));
  }

  buildDetailView(suggestion) {
    return this.uiBuilder.buildDetailView(suggestion);
  }

  buildEmptyState() {
    return this.uiBuilder.buildEmptyState();
  }

  // State management
  selectSuggestion(suggestion) {
    this.selectedSuggestion = suggestion;
    this.viewMode = 'detail';
    if (this.onSelectionChange) {
      this.onSelectionChange(suggestion);
    }
  }

  deselectSuggestion() {
    this.selectedSuggestion = null;
    this.viewMode = 'suggestions';
  }

  removeFilter(key) {
    this.engine.currentContext = {
      ...this.engine.currentContext
    };
    delete this.engine.currentContext[key];
  }

  // Properties
  get currentQuery() {
    return this.engine.currentQuery;
  }

  get currentContext() {
    return this.engine.currentContext;
  }

  get searchHistory() {
    return this.engine.getHistory();
  }
}

export { PatternSuggestionsUI };
