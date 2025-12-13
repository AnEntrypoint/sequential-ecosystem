// Pattern integration state persistence
export class PatternIntegrationState {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.insertedPatterns = [];
    this.selectedPattern = null;
  }

  exportEditorState() {
    return {
      insertedPatterns: this.insertedPatterns,
      selectedPattern: this.selectedPattern,
      timestamp: new Date().toISOString()
    };
  }

  importEditorState(state) {
    this.insertedPatterns = state.insertedPatterns || [];
    this.selectedPattern = state.selectedPattern || null;
    this.eventBus.emit('state-imported', state);
    return this;
  }

  setInsertedPatterns(patterns) {
    this.insertedPatterns = patterns;
    return this;
  }

  setSelectedPattern(pattern) {
    this.selectedPattern = pattern;
    return this;
  }
}
