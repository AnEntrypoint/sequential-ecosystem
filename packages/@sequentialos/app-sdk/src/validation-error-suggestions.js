/**
 * validation-error-suggestions.js - Validation Error Suggestions Facade
 *
 * Delegates to focused modules:
 * - constraint-formatter: Format constraint values and messages
 * - validation-suggester: Enhance errors and validate with suggestions
 */

import { ValidationSuggester } from './validation-suggester.js';

export function createValidationErrorSuggestions() {
  const suggester = new ValidationSuggester();
  return {
    formatConstraintValue: suggester.formatter.formatConstraintValue.bind(suggester.formatter),
    buildConstraintMessage: suggester.formatter.buildConstraintMessage.bind(suggester.formatter),
    enhanceValidationError: suggester.enhanceValidationError.bind(suggester),
    validateWithSuggestions: suggester.validateWithSuggestions.bind(suggester),
    formatErrorSummary: suggester.formatErrorSummary.bind(suggester)
  };
}
