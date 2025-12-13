// Fuzzy search and Levenshtein distance algorithms
export class SearchFuzzy {
  constructor(index) {
    this.index = index;
  }

  fuzzySearch(query, limit = 10) {
    const results = [];

    this.index.patterns.forEach((pattern, patternId) => {
      const score = this.calculateFuzzyScore(query, pattern);
      if (score > 0.3) {
        results.push({
          patternId,
          pattern,
          score
        });
      }
    });

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  calculateFuzzyScore(query, pattern) {
    const queryLower = query.toLowerCase();
    const nameLower = (pattern.name || '').toLowerCase();
    const descLower = (pattern.description || '').toLowerCase();

    let score = 0;

    if (nameLower.includes(queryLower)) {
      score += 1;
    } else {
      const similarity = this.levenshteinSimilarity(queryLower, nameLower);
      score += similarity * 0.8;
    }

    if (descLower.includes(queryLower)) {
      score += 0.5;
    }

    const tags = pattern.tags || [];
    const tagMatches = tags.filter(t => t.toLowerCase().includes(queryLower)).length;
    score += (tagMatches / Math.max(tags.length, 1)) * 0.5;

    return Math.min(score, 1);
  }

  levenshteinSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(s1, s2) {
    const costs = [];

    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }

    return costs[s2.length];
  }
}
