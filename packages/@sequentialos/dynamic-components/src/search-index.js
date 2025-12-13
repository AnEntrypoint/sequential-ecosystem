// Search index management and tokenization
export class SearchIndex {
  constructor() {
    this.index = new Map();
    this.patterns = new Map();
    this.tokens = new Map();
    this.vocabulary = new Set();
    this.tf = new Map();
    this.idf = new Map();
    this.documentCount = 0;
  }

  addPattern(patternId, pattern) {
    this.patterns.set(patternId, pattern);
    this.indexPattern(patternId, pattern);
    this.updateTFIDF();
  }

  indexPattern(patternId, pattern) {
    const tokens = this.tokenize(pattern);

    tokens.forEach(token => {
      if (!this.index.has(token)) {
        this.index.set(token, new Set());
      }
      this.index.get(token).add(patternId);
      this.vocabulary.add(token);
    });

    if (!this.tokens.has(patternId)) {
      this.tokens.set(patternId, new Set());
    }
    tokens.forEach(token => this.tokens.get(patternId).add(token));

    this.documentCount++;
  }

  tokenize(text) {
    if (typeof text !== 'string') text = JSON.stringify(text);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2 && !this.isStopword(token));
  }

  isStopword(token) {
    const stopwords = ['the', 'and', 'or', 'is', 'are', 'was', 'were', 'be', 'to', 'of', 'in', 'a', 'an', 'for', 'with', 'by', 'on', 'at', 'from', 'as'];
    return stopwords.includes(token);
  }

  updateTFIDF() {
    this.patterns.forEach((pattern, patternId) => {
      const tf = new Map();
      const tokens = this.tokens.get(patternId) || new Set();

      tokens.forEach(token => {
        const count = this.countTokenOccurrences(patternId, token);
        tf.set(token, count / Math.max(tokens.size, 1));
      });

      this.tf.set(patternId, tf);
    });

    this.vocabulary.forEach(token => {
      const docsWithToken = this.index.get(token)?.size || 0;
      const idf = Math.log((this.documentCount + 1) / (docsWithToken + 1));
      this.idf.set(token, idf);
    });
  }

  countTokenOccurrences(patternId, token) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return 0;

    const text = JSON.stringify(pattern).toLowerCase();
    const regex = new RegExp(`\\b${token}\\b`, 'g');
    return (text.match(regex) || []).length;
  }

  clearIndex() {
    this.index.clear();
    this.patterns.clear();
    this.tokens.clear();
    this.vocabulary.clear();
    this.tf.clear();
    this.idf.clear();
    this.documentCount = 0;
  }
}
