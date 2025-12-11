import { PatternLibraryBase } from '../../pattern-library-base.js';
import { modalPatterns } from './modal-patterns.js';

class ModalPatternLibrary extends PatternLibraryBase {
  constructor() {
    super(null);
    this.registerAllPatterns();
  }

  registerAllPatterns() {
    modalPatterns.forEach(pattern => {
      this.registerPattern(pattern.id, pattern);
    });
  }
}

function createModalPatternLibrary() {
  return new ModalPatternLibrary();
}

export { ModalPatternLibrary, createModalPatternLibrary };
