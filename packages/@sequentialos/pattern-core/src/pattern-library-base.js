export class PatternLibraryBase {
  constructor(themeEngine) {
    this.theme = themeEngine;
    this.patterns = new Map();
  }

  registerPattern(id, pattern) {
    this.patterns.set(id, pattern);
    return this;
  }

  registerPatterns(patterns) {
    patterns.forEach(p => this.registerPattern(p.id, p));
    return this;
  }

  getAllPatterns() {
    return Array.from(this.patterns.values());
  }

  getPattern(id) {
    return this.patterns.get(id);
  }

  getPatternsByCategory(category) {
    return Array.from(this.patterns.values()).filter(p => p.category === category);
  }

  searchPatterns(query) {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.patterns.values()).filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      (p.tags && p.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }

  getPatternsByTag(tag) {
    const lowerTag = tag.toLowerCase();
    return Array.from(this.patterns.values()).filter(p =>
      p.tags && p.tags.some(t => t.toLowerCase() === lowerTag)
    );
  }

  getPatternsByCodeReduction(minReduction) {
    return Array.from(this.patterns.values()).filter(p => {
      const reduction = parseInt(p.codeReduction);
      return reduction >= minReduction;
    });
  }

  getPatternCount() {
    return this.patterns.size;
  }

  getCategoryCount(category) {
    return this.getPatternsByCategory(category).length;
  }

  getMetadata() {
    return {
      total: this.getPatternCount(),
      categories: [...new Set(this.getAllPatterns().map(p => p.category))],
      avgCodeReduction: this.calculateAvgCodeReduction()
    };
  }

  calculateAvgCodeReduction() {
    const patterns = this.getAllPatterns();
    if (patterns.length === 0) return 0;
    const total = patterns.reduce((sum, p) => sum + parseInt(p.codeReduction || 0), 0);
    return Math.round(total / patterns.length);
  }
}
