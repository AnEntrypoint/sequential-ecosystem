// Pattern discovery facade - maintains 100% backward compatibility
import { DiscoveryLibraryManager } from './discovery-library-manager.js';
import { DiscoverySearchEngine } from './discovery-search-engine.js';
import { DiscoveryFiltersAnalytics } from './discovery-filters-analytics.js';
import { DiscoveryUIBuilder } from './discovery-ui-builder.js';

class PatternDiscovery {
  constructor(includeExtended = true) {
    this.libraryManager = new DiscoveryLibraryManager();
    this.libraryManager.initializeLibraries(includeExtended);

    this.allPatterns = this.libraryManager.getAllPatterns();
    this.libraries = this.libraryManager.getLibraries();

    this.searchEngine = new DiscoverySearchEngine(this.allPatterns);
    this.filtersAnalytics = new DiscoveryFiltersAnalytics(this.allPatterns);
    this.uiBuilder = new DiscoveryUIBuilder();

    // Index for backward compatibility
    this.index = this.searchEngine.index;
    this.includeExtended = includeExtended;
  }

  // Delegate to search engine
  buildSearchIndex() {
    this.searchEngine.buildSearchIndex();
  }

  tokenize(text) {
    return this.searchEngine.tokenize(text);
  }

  search(query) {
    return this.searchEngine.search(query);
  }

  // Delegate to filters & analytics
  filterByCategory(category) {
    return this.filtersAnalytics.filterByCategory(category);
  }

  filterByCodeReduction(minReduction) {
    return this.filtersAnalytics.filterByCodeReduction(minReduction);
  }

  filterByTags(tags) {
    return this.filtersAnalytics.filterByTags(tags);
  }

  getCategories() {
    return this.filtersAnalytics.getCategories();
  }

  getAllTags() {
    return this.filtersAnalytics.getAllTags();
  }

  getPatternStats() {
    return this.filtersAnalytics.getPatternStats();
  }

  calculateAverageReduction() {
    return this.filtersAnalytics.calculateAverageReduction();
  }

  getMostCommonTags(limit) {
    return this.filtersAnalytics.getMostCommonTags(limit);
  }

  getPatternsPerCategory() {
    return this.filtersAnalytics.getPatternsPerCategory();
  }

  getPattern(id) {
    return this.filtersAnalytics.getPattern(id);
  }

  getRelatedPatterns(patternId, limit = 5) {
    return this.filtersAnalytics.getRelatedPatterns(patternId, limit);
  }

  // Delegate to UI builder
  buildDiscoveryUI() {
    const stats = this.getPatternStats();
    return this.uiBuilder.buildDiscoveryUI(stats, this.getAllTags());
  }

  buildSearchUI() {
    return this.uiBuilder.buildSearchUI(this.getAllTags());
  }
}

function createPatternDiscovery() {
  return new PatternDiscovery();
}

export { PatternDiscovery, createPatternDiscovery };
