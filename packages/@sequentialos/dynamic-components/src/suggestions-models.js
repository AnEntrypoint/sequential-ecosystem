// Suggestion models for different analysis types
export class SuggestionsModels {
  constructor(library, scoring, engine) {
    this.library = library;
    this.scoring = scoring;
    this.engine = engine;
  }

  createSimilarityModel() {
    return {
      compare: (a, b) => this.scoring.calculateTextSimilarity(a, b),
      threshold: 0.5
    };
  }

  createFrequencyModel() {
    return {
      getFrequency: (patternId) => {
        const usage = this.library.getUsage(patternId);
        return usage ? usage.count : 0;
      },
      getRanking: () => {
        return Array.from(this.library.usage.values())
          .sort((a, b) => b.count - a.count);
      }
    };
  }

  createCompositionModel() {
    return {
      findPatterns: (context) => this.engine.suggestPatterns('', context),
      suggestCompositions: (patterns) => this.engine.suggestCompositions(patterns)
    };
  }
}
