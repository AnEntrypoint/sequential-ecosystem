// Pattern search index facade - maintains 100% backward compatibility
import { SearchIndex } from './search-index.js';
import { SearchEngine } from './search-engine.js';
import { SearchFuzzy } from './search-fuzzy.js';
import { SearchUI } from './search-ui.js';

class PatternSearchIndex {
  constructor() {
    this.index = new SearchIndex();
    this.engine = new SearchEngine(this.index);
    this.fuzzy = new SearchFuzzy(this.index);
    this.ui = new SearchUI(this.index);

    // Expose for backward compatibility
    this.patterns = this.index.patterns;
    this.vocabulary = this.index.vocabulary;
    this.documentCount = this.index.documentCount;
  }

  addPattern(patternId, pattern) {
    return this.index.addPattern(patternId, pattern);
  }

  indexPattern(patternId, pattern) {
    return this.index.indexPattern(patternId, pattern);
  }

  tokenize(text) {
    return this.index.tokenize(text);
  }

  isStopword(token) {
    return this.index.isStopword(token);
  }

  updateTFIDF() {
    return this.index.updateTFIDF();
  }

  countTokenOccurrences(patternId, token) {
    return this.index.countTokenOccurrences(patternId, token);
  }

  search(query, limit = 10) {
    return this.engine.search(query, limit);
  }

  advancedSearch(filters = {}) {
    return this.engine.advancedSearch(filters);
  }

  getAutocompleteSuggestions(partial, limit = 5) {
    return this.engine.getAutocompleteSuggestions(partial, limit);
  }

  fuzzySearch(query, limit = 10) {
    return this.fuzzy.fuzzySearch(query, limit);
  }

  calculateFuzzyScore(query, pattern) {
    return this.fuzzy.calculateFuzzyScore(query, pattern);
  }

  levenshteinSimilarity(str1, str2) {
    return this.fuzzy.levenshteinSimilarity(str1, str2);
  }

  levenshteinDistance(s1, s2) {
    return this.fuzzy.levenshteinDistance(s1, s2);
  }

  buildSearchUI() {
    return this.ui.buildSearchUI();
  }

  exportIndex() {
    return this.ui.exportIndex();
  }

  clearIndex() {
    return this.index.clearIndex();
  }
}

function createPatternSearchIndex() {
  return new PatternSearchIndex();
}

export { PatternSearchIndex, createPatternSearchIndex };
