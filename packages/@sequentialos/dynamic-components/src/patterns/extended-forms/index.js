import { PatternLibraryBase } from '@sequentialos/pattern-core';
import { textInputPatterns } from './text-input-patterns.js';
import { selectionPatterns } from './selection-patterns.js';
import { pickerPatterns } from './picker-patterns.js';
import { uploadPatterns } from './upload-patterns.js';
import { advancedPatterns } from './advanced-patterns.js';

export class FormPatternsExtended extends PatternLibraryBase {
  constructor() {
    super('extended-forms');
    this.registerAllPatterns();
  }

  registerAllPatterns() {
    const allPatterns = [
      ...Object.values(textInputPatterns),
      ...Object.values(selectionPatterns),
      ...Object.values(pickerPatterns),
      ...Object.values(uploadPatterns),
      ...Object.values(advancedPatterns)
    ];

    allPatterns.forEach(pattern => {
      this.registerPattern(pattern.id, pattern);
    });
  }
}

export const createFormPatternsExtended = () => new FormPatternsExtended();

export { textInputPatterns, selectionPatterns, pickerPatterns, uploadPatterns, advancedPatterns };
