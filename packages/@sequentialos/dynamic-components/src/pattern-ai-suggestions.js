// Facade maintaining 100% backward compatibility
import { AISuggestionRules } from './ai-suggestion-rules.js';
import { AISuggestionAnalyzer } from './ai-suggestion-analyzer.js';
import { AISuggestionOptimizer } from './ai-suggestion-optimizer.js';

class PatternAISuggestions {
  constructor() {
    this.patterns = new Map();
    this.suggestions = [];
    this.listeners = [];
    this.rules = new AISuggestionRules();
    this.analyzer = new AISuggestionAnalyzer(this.rules);
    this.optimizer = new AISuggestionOptimizer();
  }

  // Pattern management
  registerPattern(patternId, definition, metadata = {}) {
    this.patterns.set(patternId, {
      id: patternId,
      definition,
      ...metadata
    });
  }

  getPattern(patternId) {
    return this.patterns.get(patternId);
  }

  // Analysis (delegated to analyzer)
  analyzePattern(patternId, definition) {
    return this.analyzer.analyzePattern(patternId, definition);
  }

  suggestRelatedPatterns(patternId, allPatterns = []) {
    return this.analyzer.suggestRelatedPatterns(patternId, allPatterns);
  }

  calculateSimilarity(pattern1, pattern2) {
    return this.analyzer.calculateSimilarity(pattern1, pattern2);
  }

  calculateComplementarity(pattern1, pattern2) {
    return this.analyzer.calculateComplementarity(pattern1, pattern2);
  }

  // Optimization (delegated to optimizer)
  suggestOptimizations(patternId, definition) {
    return this.optimizer.suggestOptimizations(patternId, definition);
  }

  // Utility methods
  on(event, callback) {
    this.listeners.push({ event, callback });
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(l => !(l.event === event && l.callback === callback));
  }

  emit(event, data) {
    for (const listener of this.listeners) {
      if (listener.event === event) {
        listener.callback(data);
      }
    }
  }

  clear() {
    this.patterns.clear();
    this.suggestions = [];
    this.analyzer.clear();
  }
}

function createPatternAISuggestions() {
  return new PatternAISuggestions();
}

export { PatternAISuggestions, createPatternAISuggestions };
