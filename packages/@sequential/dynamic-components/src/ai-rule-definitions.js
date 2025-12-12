/**
 * ai-rule-definitions.js - AI suggestion rule definitions
 *
 * Performance, accessibility, and design suggestion rules
 */

import { PatternAnalyzers } from './ai-suggestion-analyzers.js';

export class AIRuleDefinitions {
  static getPerformanceRules() {
    return [
      {
        name: 'Use memoization',
        detect: (pattern) => pattern.definition && pattern.definition.children?.length > 5,
        suggestion: 'This pattern has many children. Consider using composition to reduce re-renders.'
      },
      {
        name: 'Optimize event handlers',
        detect: (pattern) => PatternAnalyzers.countEventHandlers(pattern.definition) > 3,
        suggestion: 'Too many event handlers. Consider using delegation or event bubbling.'
      },
      {
        name: 'Extract reusable components',
        detect: (pattern) => PatternAnalyzers.hasDuplicateStructures(pattern.definition),
        suggestion: 'Duplicate structures detected. Extract to reusable pattern.'
      }
    ];
  }

  static getAccessibilityRules() {
    return [
      {
        name: 'Add ARIA labels',
        detect: (pattern) => PatternAnalyzers.missingAriaLabels(pattern.definition),
        suggestion: 'Add aria-label or aria-describedby for better accessibility.'
      },
      {
        name: 'Ensure color contrast',
        detect: (pattern) => PatternAnalyzers.hasLowContrast(pattern.definition),
        suggestion: 'Color contrast may be too low. Ensure text is readable.'
      },
      {
        name: 'Add keyboard navigation',
        detect: (pattern) => PatternAnalyzers.missingKeyboardSupport(pattern.definition),
        suggestion: 'Add keyboard event handlers for better accessibility.'
      }
    ];
  }

  static getDesignRules() {
    return [
      {
        name: 'Use consistent spacing',
        detect: (pattern) => PatternAnalyzers.hasInconsistentSpacing(pattern.definition),
        suggestion: 'Spacing values are inconsistent. Use a standard spacing scale.'
      },
      {
        name: 'Apply responsive design',
        detect: (pattern) => !PatternAnalyzers.hasResponsiveStyles(pattern.definition),
        suggestion: 'Pattern not responsive. Add breakpoint-specific styles.'
      },
      {
        name: 'Improve visual hierarchy',
        detect: (pattern) => !PatternAnalyzers.hasVisualHierarchy(pattern.definition),
        suggestion: 'Improve visual hierarchy with font sizes and weights.'
      }
    ];
  }

  static getAllRules() {
    return {
      performance: this.getPerformanceRules(),
      accessibility: this.getAccessibilityRules(),
      design: this.getDesignRules()
    };
  }
}
