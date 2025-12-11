// Pattern insertion and selection lifecycle
export class PatternIntegrationLifecycle {
  constructor(discovery, eventBus) {
    this.discovery = discovery;
    this.eventBus = eventBus;
    this.selectedPattern = null;
    this.insertedPatterns = [];
  }

  searchPatterns(query) {
    const results = this.discovery.search(query);
    this.eventBus.emit('search-complete', results);
    return results;
  }

  selectPattern(patternId) {
    this.selectedPattern = this.discovery.getPattern(patternId);
    this.eventBus.emit('pattern-selected', this.selectedPattern);
    return this.selectedPattern;
  }

  insertPattern(patternId, position = 'append') {
    const pattern = this.discovery.getPattern(patternId);
    if (!pattern) return null;

    const insertion = {
      id: `inserted-${Date.now()}-${Math.random()}`,
      patternId: pattern.id,
      pattern: pattern,
      position: position,
      timestamp: new Date().toISOString()
    };

    this.insertedPatterns.push(insertion);
    this.eventBus.emit('pattern-inserted', insertion);
    return insertion;
  }

  removeInsertion(insertionId) {
    const idx = this.insertedPatterns.findIndex(i => i.id === insertionId);
    if (idx >= 0) {
      const removed = this.insertedPatterns.splice(idx, 1)[0];
      this.eventBus.emit('pattern-removed', removed);
      return removed;
    }
    return null;
  }

  getInsertedPatterns() {
    return this.insertedPatterns;
  }

  getPatternCode(patternId) {
    const pattern = this.discovery.getPattern(patternId);
    if (!pattern) return null;
    return JSON.stringify(pattern.definition, null, 2);
  }
}
