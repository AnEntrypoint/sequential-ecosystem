// Pattern analysis and suggestion generation
export class AISuggestionAnalyzer {
  constructor(rules) {
    this.rules = rules;
    this.analysisCache = new Map();
  }

  analyzePattern(patternId, definition) {
    const cacheKey = JSON.stringify(definition);
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey);
    }

    const analysis = {
      patternId,
      timestamp: Date.now(),
      issues: [],
      suggestions: [],
      score: 100,
      breakdown: {
        performance: 100,
        accessibility: 100,
        design: 100
      }
    };

    for (const [category, ruleSet] of Object.entries(this.rules.rules)) {
      for (const rule of ruleSet) {
        if (rule.detect({ definition, id: patternId })) {
          analysis.issues.push(rule.name);
          analysis.suggestions.push({
            category,
            rule: rule.name,
            message: rule.suggestion,
            severity: this.calculateSeverity(rule.name)
          });
          const categoryScore = this.calculateCategoryScore(category, analysis.issues.length);
          analysis.breakdown[category] = categoryScore;
          analysis.score = (analysis.breakdown.performance + analysis.breakdown.accessibility + analysis.breakdown.design) / 3;
        }
      }
    }

    this.analysisCache.set(cacheKey, analysis);
    return analysis;
  }

  calculateSeverity(ruleName) {
    const criticalRules = ['hasLowContrast', 'missingAriaLabels', 'missingKeyboardSupport'];
    if (criticalRules.some(r => ruleName.includes(r))) return 'critical';
    const highRules = ['hasDuplicateStructures', 'hasInconsistentSpacing'];
    if (highRules.some(r => ruleName.includes(r))) return 'high';
    return 'medium';
  }

  calculateCategoryScore(category, issueCount) {
    return Math.max(0, 100 - (issueCount * 15));
  }

  suggestRelatedPatterns(patternId, patterns = []) {
    const pattern = patterns.find(p => p.id === patternId);
    if (!pattern) return [];

    const similar = [];
    const complementary = [];

    for (const otherPattern of patterns) {
      if (otherPattern.id === patternId) continue;
      const similarity = this.calculateSimilarity(pattern, otherPattern);
      if (similarity > 0.6) {
        similar.push({ patternId: otherPattern.id, score: similarity });
      }
      const complementarity = this.calculateComplementarity(pattern, otherPattern);
      if (complementarity > 0.7) {
        complementary.push({ patternId: otherPattern.id, score: complementarity });
      }
    }

    return {
      similar: similar.sort((a, b) => b.score - a.score),
      complementary: complementary.sort((a, b) => b.score - a.score)
    };
  }

  calculateSimilarity(pattern1, pattern2) {
    let similarity = 0;
    if (pattern1.category === pattern2.category) similarity += 0.3;
    if (pattern1.tags?.some(t => pattern2.tags?.includes(t))) similarity += 0.3;
    if (this.shapeDistance(pattern1.definition, pattern2.definition) < 0.3) similarity += 0.4;
    return similarity;
  }

  calculateComplementarity(pattern1, pattern2) {
    let complementarity = 0;
    const layout1 = this.extractLayoutType(pattern1.definition);
    const layout2 = this.extractLayoutType(pattern2.definition);
    if (!layout1 || !layout2) return 0;
    if (layout1 !== layout2) complementarity += 0.3;
    if (pattern1.category !== pattern2.category) complementarity += 0.4;
    if (!pattern1.tags?.some(t => pattern2.tags?.includes(t))) complementarity += 0.3;
    return complementarity;
  }

  extractLayoutType(definition) {
    if (!definition) return null;
    if (definition.type === 'grid') return 'grid';
    if (definition.type === 'flex') return 'flex';
    if (definition.style?.display === 'flex' && definition.style?.flexDirection === 'column') return 'stack';
    return 'default';
  }

  shapeDistance(def1, def2) {
    if (!def1 || !def2) return 1;
    const depth1 = this.getDepth(def1);
    const depth2 = this.getDepth(def2);
    const depthDiff = Math.abs(depth1 - depth2) / Math.max(depth1, depth2, 1);
    const childDiff = Math.abs((def1.children?.length || 0) - (def2.children?.length || 0)) / Math.max(def1.children?.length || 1, def2.children?.length || 1);
    return (depthDiff + childDiff) / 2;
  }

  getDepth(definition, current = 0) {
    if (!definition) return current;
    if (!definition.children || definition.children.length === 0) return current;
    return Math.max(...definition.children.map(child => this.getDepth(child, current + 1)));
  }

  clear() {
    this.analysisCache.clear();
  }
}
