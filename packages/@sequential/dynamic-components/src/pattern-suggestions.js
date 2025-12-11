// Pattern suggestions facade - maintains 100% backward compatibility
import { SuggestionsLibrary } from './suggestions-library.js';
import { SuggestionsScoring } from './suggestions-scoring.js';
import { SuggestionsEngine } from './suggestions-engine.js';
import { SuggestionsUIBuilder } from './suggestions-ui-builder.js';
import { SuggestionsModels } from './suggestions-models.js';

class PatternSuggestionsEngine {
  constructor(patternLibrary = []) {
    this.library = new SuggestionsLibrary(patternLibrary);
    this.scoring = new SuggestionsScoring(this.library);
    this.engine = new SuggestionsEngine(this.library, this.scoring);
    this.uiBuilder = new SuggestionsUIBuilder();
    this.modelsFactory = new SuggestionsModels(this.library, this.scoring, this.engine);

    this.models = {
      similarity: this.modelsFactory.createSimilarityModel(),
      frequency: this.modelsFactory.createFrequencyModel(),
      composition: this.modelsFactory.createCompositionModel()
    };

    // Expose for backward compatibility
    this.usage = this.library.usage;
    this.context = this.library.context;
  }

  registerPattern(patternId, metadata) {
    return this.library.registerPattern(patternId, metadata);
  }

  recordUsage(patternId, context = {}) {
    return this.library.recordUsage(patternId, context);
  }

  suggestPatterns(query, context = {}, limit = 5) {
    return this.engine.suggestPatterns(query, context, limit);
  }

  calculateScore(pattern, query, context) {
    return this.scoring.calculateScore(pattern, query, context);
  }

  calculateTextSimilarity(query, pattern) {
    return this.scoring.calculateTextSimilarity(query, pattern);
  }

  calculateContextRelevance(pattern, context) {
    return this.scoring.calculateContextRelevance(pattern, context);
  }

  calculateRecencyScore(pattern) {
    return this.scoring.calculateRecencyScore(pattern);
  }

  generateReasoning(pattern, query, context) {
    return this.engine.generateReasoning(pattern, query, context);
  }

  suggestCompositions(patterns, limit = 3) {
    return this.engine.suggestCompositions(patterns, limit);
  }

  calculateCompatibility(p1, p2) {
    return this.scoring.calculateCompatibility(p1, p2);
  }

  suggestLayout(p1, p2) {
    return this.engine.suggestLayout(p1, p2);
  }

  suggestNextPatterns(currentPatternId, limit = 3) {
    return this.engine.suggestNextPatterns(currentPatternId, limit);
  }

  createSimilarityModel() {
    return this.modelsFactory.createSimilarityModel();
  }

  createFrequencyModel() {
    return this.modelsFactory.createFrequencyModel();
  }

  createCompositionModel() {
    return this.modelsFactory.createCompositionModel();
  }

  buildSuggestionsUI(suggestions) {
    return this.uiBuilder.buildSuggestionsUI(suggestions);
  }

  getScoreColor(score) {
    return this.uiBuilder.getScoreColor(score);
  }

  exportSuggestions(suggestions) {
    return this.uiBuilder.exportSuggestions(suggestions);
  }
}

function createPatternSuggestionsEngine(library) {
  return new PatternSuggestionsEngine(library);
}

export { PatternSuggestionsEngine, createPatternSuggestionsEngine };
