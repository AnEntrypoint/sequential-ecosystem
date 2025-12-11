import { PatternLibraryBase } from '../../pattern-library-base.js';
import { authPatterns } from './auth-patterns.js';
import { contactPatterns } from './contact-patterns.js';
import { accountPatterns } from './account-patterns.js';

class FormPatternLibrary extends PatternLibraryBase {
  constructor(themeEngine) {
    super(themeEngine);
    this.registerAllPatterns();
  }

  registerAllPatterns() {
    [...authPatterns, ...contactPatterns, ...accountPatterns].forEach(pattern => {
      this.registerPattern(pattern.id, pattern);
    });
  }
}

function createFormPatternLibrary(themeEngine) {
  return new FormPatternLibrary(themeEngine);
}

export { FormPatternLibrary, createFormPatternLibrary };
