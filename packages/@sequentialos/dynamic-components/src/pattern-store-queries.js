// Pattern search and query operations
export class PatternQueries {
  constructor(patterns, categories, searchIndex, featured, listeners) {
    this.patterns = patterns;
    this.categories = categories;
    this.searchIndex = searchIndex;
    this.featured = featured;
    this.listeners = listeners;
  }

  search(query, filters = {}) {
    const normalizedQuery = query.toLowerCase().trim();
    let results = new Set();

    if (normalizedQuery) {
      const words = normalizedQuery.split(/\s+/);
      words.forEach(word => {
        const matchingPatterns = this.searchIndex.get(word) || [];
        matchingPatterns.forEach(id => results.add(id));
        for (const [key, ids] of this.searchIndex.entries()) {
          if (key.includes(word)) {
            ids.forEach(id => results.add(id));
          }
        }
      });
    } else {
      results = new Set(this.patterns.keys());
    }

    let patterns = Array.from(results)
      .map(id => this.patterns.get(id))
      .filter(Boolean);

    if (filters.category) {
      patterns = patterns.filter(p => p.category === filters.category);
    }
    if (filters.minRating) {
      patterns = patterns.filter(p => p.rating >= filters.minRating);
    }
    if (filters.author) {
      patterns = patterns.filter(p => p.author === filters.author);
    }

    if (filters.sortBy === 'downloads') {
      patterns.sort((a, b) => b.downloadCount - a.downloadCount);
    } else if (filters.sortBy === 'rating') {
      patterns.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'recent') {
      patterns.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    return patterns;
  }

  getPatternsByCategory(category) {
    const patternIds = this.categories.get(category) || [];
    return patternIds
      .map(id => this.patterns.get(id))
      .filter(p => p && p.isPublished);
  }

  getCategories() {
    return Array.from(this.categories.keys());
  }

  getFeaturedPatterns(limit = 10) {
    return this.featured
      .slice(0, limit)
      .map(id => this.patterns.get(id))
      .filter(Boolean);
  }

  getTrendingPatterns(limit = 10) {
    return Array.from(this.patterns.values())
      .filter(p => p.isPublished)
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, limit);
  }

  getTopRatedPatterns(limit = 10) {
    return Array.from(this.patterns.values())
      .filter(p => p.isPublished)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }
}
