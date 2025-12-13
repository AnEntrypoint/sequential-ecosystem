// Pattern suggestion and composition engine
export class SuggestionsEngine {
  constructor(library, scoring) {
    this.library = library;
    this.scoring = scoring;
  }

  suggestPatterns(query, context = {}, limit = 5) {
    const scored = this.library.getLibrary().map(pattern => ({
      ...pattern,
      score: this.scoring.calculateScore(pattern, query, context)
    }));

    const sorted = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return sorted.map((p, idx) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      score: p.score,
      rank: idx + 1,
      reasoning: this.generateReasoning(p, query, context),
      tags: p.tags,
      codeReduction: p.codeReduction
    }));
  }

  generateReasoning(pattern, query, context) {
    const reasons = [];

    if (query && pattern.name?.toLowerCase().includes(query.toLowerCase())) {
      reasons.push(`Matches query "${query}"`);
    }

    if (context.category && pattern.category === context.category) {
      reasons.push(`Same category: ${context.category}`);
    }

    const usage = this.library.getUsage(pattern.id);
    if (usage && usage.count > 5) {
      reasons.push(`Popular (${usage.count} uses)`);
    }

    if (pattern.codeReduction) {
      reasons.push(`Reduces ${pattern.codeReduction} lines of code`);
    }

    return reasons.length > 0 ? reasons : ['Good overall match'];
  }

  suggestCompositions(patterns, limit = 3) {
    const compositions = [];

    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const p1 = patterns[i];
        const p2 = patterns[j];
        const compatibility = this.scoring.calculateCompatibility(p1, p2);

        if (compatibility.score > 0.6) {
          compositions.push({
            patterns: [p1.id, p2.id],
            score: compatibility.score,
            reason: compatibility.reason,
            layout: this.suggestLayout(p1, p2)
          });
        }
      }
    }

    return compositions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  suggestLayout(p1, p2) {
    if (p1.category === 'header' && p2.category === 'content') return 'vertical';
    if (p1.category === 'sidebar' && p2.category === 'content') return 'horizontal';
    if (p1.category === 'button' && p2.category === 'button') return 'horizontal';
    return 'vertical';
  }

  suggestNextPatterns(currentPatternId, limit = 3) {
    const current = this.library.findPattern(currentPatternId);
    if (!current) return [];

    const candidates = this.library.getLibrary().filter(p => p.id !== currentPatternId);
    const suggestions = [];

    candidates.forEach(candidate => {
      const compatibility = this.scoring.calculateCompatibility(current, candidate);
      if (compatibility.score > 0.5) {
        suggestions.push({
          id: candidate.id,
          name: candidate.name,
          score: compatibility.score,
          reason: compatibility.reason,
          layout: this.suggestLayout(current, candidate)
        });
      }
    });

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
