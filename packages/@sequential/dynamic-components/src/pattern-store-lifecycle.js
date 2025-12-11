// Pattern lifecycle management (publish, unpublish, update)
export class PatternLifecycle {
  constructor(patterns, categories, searchIndex, listeners) {
    this.patterns = patterns;
    this.categories = categories;
    this.searchIndex = searchIndex;
    this.listeners = listeners;
  }

  publishPattern(patternId, metadata, definition) {
    const pattern = {
      id: patternId,
      name: metadata.name,
      description: metadata.description || '',
      author: metadata.author || 'Anonymous',
      version: metadata.version || '1.0.0',
      category: metadata.category || 'general',
      tags: metadata.tags || [],
      definition,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: true,
      isFeatured: false,
      downloadCount: 0,
      rating: 0,
      reviewCount: 0,
      license: metadata.license || 'MIT',
      repository: metadata.repository || '',
      homepage: metadata.homepage || '',
      keywords: metadata.keywords || []
    };

    this.patterns.set(patternId, pattern);
    this.indexPatternForSearch(patternId, pattern);
    this.addToCategory(metadata.category, patternId);
    this.notifyListeners('patternPublished', { patternId, pattern });
    return patternId;
  }

  unpublishPattern(patternId) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return false;
    pattern.isPublished = false;
    this.notifyListeners('patternUnpublished', { patternId });
    return true;
  }

  updatePattern(patternId, metadata, definition) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return false;

    Object.assign(pattern, {
      name: metadata.name || pattern.name,
      description: metadata.description || pattern.description,
      version: metadata.version || pattern.version,
      tags: metadata.tags || pattern.tags,
      keywords: metadata.keywords || pattern.keywords,
      updatedAt: new Date().toISOString()
    });

    if (definition) {
      pattern.definition = JSON.parse(JSON.stringify(definition));
    }

    this.notifyListeners('patternUpdated', { patternId, pattern });
    return true;
  }

  indexPatternForSearch(patternId, pattern) {
    const searchTerms = [
      pattern.name,
      pattern.description,
      pattern.author,
      ...pattern.tags,
      ...pattern.keywords,
      pattern.category
    ].filter(Boolean);

    searchTerms.forEach(term => {
      const normalized = term.toLowerCase().trim();
      if (!this.searchIndex.has(normalized)) {
        this.searchIndex.set(normalized, []);
      }
      const patterns = this.searchIndex.get(normalized);
      if (!patterns.includes(patternId)) {
        patterns.push(patternId);
      }
    });
  }

  addToCategory(category, patternId) {
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    const patterns = this.categories.get(category);
    if (!patterns.includes(patternId)) {
      patterns.push(patternId);
    }
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Marketplace listener error for ${event}:`, e);
        }
      });
  }
}
