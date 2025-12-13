// Pattern filtering, analytics, and relationship discovery
export class DiscoveryFiltersAnalytics {
  constructor(patterns = []) {
    this.patterns = patterns;
  }

  filterByCategory(category) {
    return this.patterns.filter(p => p.category === category);
  }

  filterByCodeReduction(minReduction) {
    return this.patterns.filter(p => {
      const reduction = parseInt(p.codeReduction);
      return reduction >= minReduction;
    });
  }

  filterByTags(tags) {
    return this.patterns.filter(p =>
      tags.some(tag => p.tags.includes(tag))
    );
  }

  getCategories() {
    const categories = new Set();
    this.patterns.forEach(p => categories.add(p.category));
    return Array.from(categories);
  }

  getAllTags() {
    const tags = new Set();
    this.patterns.forEach(p => {
      p.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  getPatternStats() {
    return {
      totalPatterns: this.patterns.length,
      categories: this.getCategories().length,
      averageCodeReduction: this.calculateAverageReduction(),
      mostCommonTags: this.getMostCommonTags(5),
      patternsPerCategory: this.getPatternsPerCategory()
    };
  }

  calculateAverageReduction() {
    const reductions = this.patterns.map(p => parseInt(p.codeReduction));
    return Math.round(reductions.reduce((a, b) => a + b, 0) / reductions.length);
  }

  getMostCommonTags(limit) {
    const tagCounts = {};
    this.patterns.forEach(p => {
      p.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }

  getPatternsPerCategory() {
    const counts = {};
    this.patterns.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }

  getPattern(id) {
    return this.patterns.find(p => p.id === id);
  }

  getRelatedPatterns(patternId, limit = 5) {
    const pattern = this.getPattern(patternId);
    if (!pattern) return [];

    const relatedTags = pattern.tags;
    const related = this.patterns
      .filter(p => p.id !== patternId && p.tags.some(t => relatedTags.includes(t)))
      .sort((a, b) => {
        const aMatch = a.tags.filter(t => relatedTags.includes(t)).length;
        const bMatch = b.tags.filter(t => relatedTags.includes(t)).length;
        return bMatch - aMatch;
      })
      .slice(0, limit);

    return related;
  }

  updatePatterns(patterns) {
    this.patterns = patterns;
  }
}
