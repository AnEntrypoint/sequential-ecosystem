// Pattern search and indexing functionality
export class DiscoverySearchEngine {
  constructor(patterns = []) {
    this.patterns = patterns;
    this.index = new Map();
    this.buildSearchIndex();
  }

  buildSearchIndex() {
    this.patterns.forEach((pattern, idx) => {
      const tokens = this.tokenize(
        `${pattern.name} ${pattern.description} ${pattern.tags.join(' ')}`
      );
      tokens.forEach(token => {
        if (!this.index.has(token)) {
          this.index.set(token, []);
        }
        this.index.get(token).push(idx);
      });
    });
  }

  tokenize(text) {
    return text
      .toLowerCase()
      .split(/[\s\-_]+/)
      .filter(t => t.length > 2);
  }

  search(query) {
    if (!query || query.trim().length === 0) {
      return this.patterns;
    }

    const tokens = this.tokenize(query);
    const matches = new Map();

    tokens.forEach(token => {
      const indices = this.index.get(token) || [];
      indices.forEach(idx => {
        matches.set(idx, (matches.get(idx) || 0) + 1);
      });
    });

    return Array.from(matches.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([idx]) => this.patterns[idx]);
  }

  updatePatterns(patterns) {
    this.patterns = patterns;
    this.index.clear();
    this.buildSearchIndex();
  }
}
