/**
 * validation-suggester.js - Validation with enhanced error suggestions
 *
 * Enhance errors with suggestions and validate with detailed messages
 */

import { ValidationRules } from './validation-rules.js';
import { ErrorSuggestions } from './error-suggestions.js';

export class ValidationSuggester {
  constructor() {
    this.rules = ValidationRules;
    this.suggestions = new ErrorSuggestions();
  }

  enhanceValidationError(error, fieldName, constraints, attemptedValue) {
    return this.suggestions.enhanceValidationError(error, fieldName, constraints, attemptedValue);
  }

  validateWithSuggestions(value, fieldName, schema) {
    const baseValidation = this.rules.runAllValidations(value, schema);

    const enhancedErrors = baseValidation.errors.map(error => {
      return this.enhanceValidationError(error, fieldName, schema, value);
    });

    return {
      valid: baseValidation.valid,
      errors: enhancedErrors
    };
  }

  formatErrorSummary(fieldErrors) {
    return this.suggestions.formatErrorSummary(fieldErrors);
  }
}
