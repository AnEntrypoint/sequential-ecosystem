class PatternLibraryBase {
  constructor(themeEngine) {
    this.theme = themeEngine;
    this.patterns = new Map();
  }

  registerPattern(id, pattern) {
    this.patterns.set(id, pattern);
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
}

export { PatternLibraryBase };
