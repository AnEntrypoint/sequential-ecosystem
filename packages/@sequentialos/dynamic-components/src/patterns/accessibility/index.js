import { PatternLibraryBase } from '@sequentialos/pattern-core';
import { semanticStructurePatterns } from './semantic-structure-patterns.js';
import { inputInteractivePatterns } from './input-interactive-patterns.js';
import { dialogNavPatterns } from './dialog-nav-patterns.js';
import { contentPatterns } from './content-patterns.js';

export class AccessibilityPatternLibrary extends PatternLibraryBase {
  constructor() {
    super('accessibility');
    this.registerAllPatterns();
  }

  registerAllPatterns() {
    const allPatterns = [
      ...Object.values(semanticStructurePatterns),
      ...Object.values(inputInteractivePatterns),
      ...Object.values(dialogNavPatterns),
      ...Object.values(contentPatterns)
    ];

    allPatterns.forEach(pattern => {
      this.registerPattern(pattern.id, pattern);
    });
  }

  getPatternsByWCAGLevel(level) {
    return this.getAllPatterns().filter(p => p.wcagLevel === level);
  }

  getPatternsByIssueType(issueType) {
    return this.getAllPatterns().filter(p => p.issues && p.issues.includes(issueType));
  }
}

export const createAccessibilityPatternLibrary = () => new AccessibilityPatternLibrary();

export { semanticStructurePatterns, inputInteractivePatterns, dialogNavPatterns, contentPatterns };
