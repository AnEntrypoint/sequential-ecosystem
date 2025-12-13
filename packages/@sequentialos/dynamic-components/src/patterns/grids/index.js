import { PatternLibraryBase } from '../../pattern-library-base.js';
import { gridPatterns } from './grid-patterns.js';

class GridPatternLibrary extends PatternLibraryBase {
  constructor() {
    super(null);
    this.registerAllPatterns();
  }

  registerAllPatterns() {
    gridPatterns.forEach(pattern => {
      this.registerPattern(pattern.id, pattern);
    });
  }
}

function createGridPatternLibrary() {
  return new GridPatternLibrary();
}

export { GridPatternLibrary, createGridPatternLibrary };
