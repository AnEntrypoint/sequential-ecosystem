// Marketplace state management
export class MarketplaceState {
  constructor(patternMarketplace) {
    this.marketplace = patternMarketplace;
    this.currentView = 'browse';
    this.searchQuery = '';
    this.selectedCategory = null;
    this.sortBy = 'recent';
    this.listeners = [];
  }

  setView(view) {
    this.currentView = view;
    this.notifyListeners('viewChanged', { view });
    return this;
  }

  search(query) {
    this.searchQuery = query;
    const results = this.marketplace.search(query, {
      category: this.selectedCategory,
      sortBy: this.sortBy
    });

    this.notifyListeners('searchResults', { query, results });
    return results;
  }

  setCategory(category) {
    this.selectedCategory = category;
    const results = this.marketplace.getPatternsByCategory(category);
    this.notifyListeners('categorySelected', { category, results });
    return results;
  }

  setSortBy(sortBy) {
    this.sortBy = sortBy;
    return this;
  }

  insertPattern(patternId, targetPath = null) {
    const pattern = this.marketplace.patterns.get(patternId);
    if (!pattern) return false;

    this.marketplace.downloadPattern(patternId, 'user');
    this.notifyListeners('patternInserted', {
      patternId,
      pattern,
      targetPath,
      definition: pattern.definition
    });

    return true;
  }

  toggleFavorite(patternId, userId) {
    const isFavorited = this.marketplace.isFavorited(patternId, userId);

    if (isFavorited) {
      this.marketplace.unfavoritePattern(patternId, userId);
    } else {
      this.marketplace.favoritePattern(patternId, userId);
    }

    this.notifyListeners('favoriteToggled', {
      patternId,
      isFavorited: !isFavorited
    });

    return !isFavorited;
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
    return this;
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
    return this;
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Listener error for ${event}:`, e);
        }
      });
  }

  clear() {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.listeners = [];
    return this;
  }
}
