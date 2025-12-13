// Suggestion scoring algorithms
export class SuggestionsScoring {
  constructor(library) {
    this.library = library;
  }

  calculateScore(pattern, query, context) {
    let score = 0;

    const textScore = this.calculateTextSimilarity(query, pattern);
    score += textScore * 0.4;

    const usagePattern = this.library.getUsage(pattern.id);
    const frequencyScore = usagePattern ? Math.min(usagePattern.count / 100, 1) : 0;
    score += frequencyScore * 0.2;

    const contextScore = this.calculateContextRelevance(pattern, context);
    score += contextScore * 0.3;

    const recencyScore = this.calculateRecencyScore(pattern);
    score += recencyScore * 0.1;

    return score;
  }

  calculateTextSimilarity(query, pattern) {
    if (!query) return 0.5;

    const queryLower = query.toLowerCase();
    const nameMatch = pattern.name?.toLowerCase().includes(queryLower) ? 1 : 0;
    const descMatch = pattern.description?.toLowerCase().includes(queryLower) ? 0.7 : 0;
    const tagsMatch = pattern.tags?.some(t => t.toLowerCase().includes(queryLower)) ? 0.8 : 0;

    return Math.max(nameMatch, descMatch, tagsMatch);
  }

  calculateContextRelevance(pattern, context) {
    if (!context || Object.keys(context).length === 0) return 0.5;

    let relevance = 0;

    if (context.category && pattern.category === context.category) {
      relevance += 0.4;
    }

    if (context.tags && Array.isArray(context.tags)) {
      const tagMatches = pattern.tags?.filter(t => context.tags.includes(t)).length || 0;
      relevance += Math.min(tagMatches / Math.max(context.tags.length, 1), 0.4);
    }

    if (context.codeReduction && pattern.codeReduction) {
      const reductionRatio = Math.min(pattern.codeReduction / (context.codeReduction + 1), 0.2);
      relevance += reductionRatio;
    }

    return Math.min(relevance, 1);
  }

  calculateRecencyScore(pattern) {
    const usage = this.library.getUsage(pattern.id);
    if (!usage || !usage.lastUsed) return 0;

    const ageMs = Date.now() - usage.lastUsed;
    const daysSinceUse = ageMs / (1000 * 60 * 60 * 24);

    if (daysSinceUse < 1) return 1;
    if (daysSinceUse < 7) return 0.8;
    if (daysSinceUse < 30) return 0.5;
    return 0.1;
  }

  calculateCompatibility(p1, p2) {
    let score = 0;
    const reasons = [];

    if (p1.category === p2.category) {
      score += 0.3;
      reasons.push('Same category');
    }

    const commonTags = (p1.tags || []).filter(t => (p2.tags || []).includes(t));
    if (commonTags.length > 0) {
      score += Math.min(commonTags.length / 5, 0.3);
      reasons.push(`Share tags: ${commonTags.join(', ')}`);
    }

    if (!p1.dependencies?.includes(p2.id) && !p2.dependencies?.includes(p1.id)) {
      score += 0.2;
      reasons.push('No circular dependencies');
    }

    return {
      score: Math.min(score, 1),
      reason: reasons.join('; ')
    };
  }
}
