/**
 * error-suggestions.js - Enhanced error messages with constraint details
 *
 * Format validation errors with constraint values and attempted values
 */

import { ConstraintFormatter } from './constraint-formatter.js';

export class ErrorSuggestions {
  constructor() {
    this.formatter = new ConstraintFormatter();
  }

  enhanceValidationError(error, fieldName, constraints, attemptedValue) {
    if (!error || !fieldName || !constraints) {
      return error;
    }

    let suggestion = error.message || 'Validation failed';

    if (error.reason === 'required') {
      suggestion = fieldName + ' is required';
    }

    if (error.reason === 'type') {
      suggestion = fieldName + ' must be ' + (constraints.type || 'valid');
    }

    if (error.reason === 'enum') {
      const values = constraints.enum.map(e => "'" + String(e) + "'").join(', ');
      suggestion = fieldName + ' must be one of: ' + values + '. Got: ' + this.formatter.formatConstraintValue(attemptedValue);
    }

    if (error.reason === 'minLength') {
      suggestion = fieldName + ' must be at least ' + constraints.minLength + ' characters. Got: ' + (attemptedValue ? attemptedValue.length : 0);
    }

    if (error.reason === 'maxLength') {
      suggestion = fieldName + ' must be at most ' + constraints.maxLength + ' characters. Got: ' + (attemptedValue ? attemptedValue.length : 0);
    }

    if (error.reason === 'min') {
      suggestion = fieldName + ' must be at least ' + constraints.min + '. Got: ' + attemptedValue;
    }

    if (error.reason === 'max') {
      suggestion = fieldName + ' must be at most ' + constraints.max + '. Got: ' + attemptedValue;
    }

    if (error.reason === 'pattern') {
      suggestion = fieldName + ' must match pattern ' + constraints.pattern + '. Got: ' + this.formatter.formatConstraintValue(attemptedValue);
    }

    error.enhancedMessage = suggestion;
    error.constraints = constraints;
    error.attemptedValue = attemptedValue;

    return error;
  }

  formatErrorSummary(fieldErrors) {
    const messages = fieldErrors.map(function(err) {
      return err.enhancedMessage || err.message;
    });
    return messages.join('; ');
  }
}
