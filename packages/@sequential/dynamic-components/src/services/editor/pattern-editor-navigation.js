// Navigation layer - path resolution and element navigation
export class PatternEditorNavigation {
  constructor() {
    this.currentPattern = null;
  }

  openPattern(patternId, definition) {
    this.currentPattern = {
      id: patternId,
      definition: JSON.parse(JSON.stringify(definition)),
      originalDefinition: JSON.parse(JSON.stringify(definition))
    };
    return this.currentPattern;
  }

  getElementByPath(definition, path) {
    if (!path) return definition;
    const parts = path.split('.');
    let current = definition;
    for (const part of parts) {
      if (part.startsWith('children[')) {
        const match = part.match(/children\[(\d+)\]/);
        if (match) {
          const index = parseInt(match[1], 10);
          current = current.children?.[index];
        }
      } else {
        current = current[part];
      }
      if (!current) return null;
    }
    return current;
  }

  getCurrentDefinition() {
    return this.currentPattern?.definition || null;
  }

  clear() {
    this.currentPattern = null;
  }
}
