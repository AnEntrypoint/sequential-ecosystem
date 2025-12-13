// Modal state management
import { PatternDiscovery } from './pattern-discovery.js';

export class DiscoveryModalState {
  constructor(libraries) {
    this.discovery = new PatternDiscovery(libraries);
    this.isOpen = false;
    this.searchQuery = '';
    this.selectedCategory = null;
    this.selectedPattern = null;
  }

  open() {
    this.isOpen = true;
    this.searchQuery = '';
    this.selectedPattern = null;
  }

  close() {
    this.isOpen = false;
  }

  setSearchQuery(query) {
    this.searchQuery = query;
  }

  setCategory(category) {
    this.selectedCategory = category;
  }

  selectPattern(pattern) {
    this.selectedPattern = pattern;
  }

  getFilteredPatterns() {
    let results = this.discovery.search(this.searchQuery);

    if (this.selectedCategory) {
      results = results.filter(p => p.category === this.selectedCategory);
    }

    return results;
  }
}
