// Pattern registry for documentation
export class DocsPatternRegistry {
  constructor() {
    this.patterns = new Map();
    this.categories = new Map();
  }

  registerPattern(patternId, metadata) {
    const pattern = {
      id: patternId,
      name: metadata.name || patternId,
      category: metadata.category || 'general',
      description: metadata.description || '',
      tags: metadata.tags || [],
      codeReduction: metadata.codeReduction || 0,
      dependencies: metadata.dependencies || [],
      usage: metadata.usage || '',
      example: metadata.example || '',
      properties: metadata.properties || {},
      accessibility: metadata.accessibility || [],
      performance: metadata.performance || {},
      created: Date.now(),
      updated: Date.now(),
      versions: [{ version: '1.0.0', released: new Date().toISOString() }]
    };

    this.patterns.set(patternId, pattern);
    this.updateCategoryIndex(pattern);
  }

  updateCategoryIndex(pattern) {
    if (!this.categories.has(pattern.category)) {
      this.categories.set(pattern.category, []);
    }
    const patterns = this.categories.get(pattern.category);
    if (!patterns.includes(pattern.id)) {
      patterns.push(pattern.id);
    }
  }

  getPattern(patternId) {
    return this.patterns.get(patternId);
  }

  getAllPatterns() {
    return Array.from(this.patterns.values());
  }

  getCategories() {
    return Array.from(this.categories.keys());
  }

  getPatternsInCategory(category) {
    return this.categories.get(category) || [];
  }
}
