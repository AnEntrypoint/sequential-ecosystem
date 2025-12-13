// Pattern management layer - handling pattern addition, removal, and reordering
export class PatternManager {
  constructor() {
    this.selectedPatterns = [];
  }

  addPattern(patternId, patternDef, position = null) {
    const pattern = {
      id: patternId,
      definition: JSON.parse(JSON.stringify(patternDef)),
      position: position || this.selectedPatterns.length,
      customizations: {}
    };

    this.selectedPatterns.push(pattern);
    return pattern;
  }

  removePattern(patternId) {
    const idx = this.selectedPatterns.findIndex(p => p.id === patternId);
    if (idx >= 0) {
      return this.selectedPatterns.splice(idx, 1)[0];
    }
    return null;
  }

  reorderPatterns(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.selectedPatterns.length ||
        toIndex < 0 || toIndex >= this.selectedPatterns.length) {
      return false;
    }

    const [pattern] = this.selectedPatterns.splice(fromIndex, 1);
    this.selectedPatterns.splice(toIndex, 0, pattern);
    return true;
  }

  customizePattern(patternId, customizations) {
    const pattern = this.selectedPatterns.find(p => p.id === patternId);
    if (!pattern) return false;

    pattern.customizations = { ...pattern.customizations, ...customizations };
    return true;
  }

  applyPatternVariant(patternId, variantName) {
    const pattern = this.selectedPatterns.find(p => p.id === patternId);
    if (!pattern) return false;

    pattern.variant = variantName;
    return true;
  }

  getPatterns() {
    return this.selectedPatterns;
  }

  setPatterns(patterns) {
    this.selectedPatterns = JSON.parse(JSON.stringify(patterns));
  }

  clear() {
    this.selectedPatterns = [];
  }
}
