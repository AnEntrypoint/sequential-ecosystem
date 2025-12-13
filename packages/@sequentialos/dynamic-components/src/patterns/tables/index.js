import { PatternLibraryBase } from '../../pattern-library-base.js';
import { tablePatterns } from './table-patterns.js';

class TablePatternLibrary extends PatternLibraryBase {
  constructor() {
    super(null);
    this.registerAllPatterns();
  }

  registerAllPatterns() {
    tablePatterns.forEach(pattern => {
      this.registerPattern(pattern.id, pattern);
    });
  }
}

function createTablePatternLibrary() {
  return new TablePatternLibrary();
}

export { TablePatternLibrary, createTablePatternLibrary };
