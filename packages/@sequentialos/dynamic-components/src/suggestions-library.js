// Pattern library and usage registry
export class SuggestionsLibrary {
  constructor(patternLibrary = []) {
    this.library = patternLibrary;
    this.usage = new Map();
    this.context = new Map();
  }

  registerPattern(patternId, metadata) {
    if (!this.usage.has(patternId)) {
      this.usage.set(patternId, {
        id: patternId,
        count: 0,
        lastUsed: null,
        tags: metadata.tags || [],
        category: metadata.category || 'general',
        description: metadata.description || '',
        dependencies: metadata.dependencies || []
      });
    }
  }

  recordUsage(patternId, context = {}) {
    const usage = this.usage.get(patternId);
    if (usage) {
      usage.count++;
      usage.lastUsed = Date.now();
      usage.context = context;
    }
  }

  getUsage(patternId) {
    return this.usage.get(patternId);
  }

  findPattern(patternId) {
    return this.library.find(p => p.id === patternId);
  }

  getLibrary() {
    return this.library;
  }
}
