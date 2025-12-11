import { PatternLibraryBase } from '../../pattern-library-base.js';
import { listPatterns } from './list-patterns.js';

class ListPatternLibrary extends PatternLibraryBase {
  constructor() {
    super(null);
    this.registerAllPatterns();
  }

  registerAllPatterns() {
    listPatterns.forEach(pattern => {
      this.registerPattern(pattern.id, pattern);
    });
  }
}

function createListPatternLibrary() {
  return new ListPatternLibrary();
}

export { ListPatternLibrary, createListPatternLibrary };
