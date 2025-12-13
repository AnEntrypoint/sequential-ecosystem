/**
 * constraint-formatter.js - Constraint value and message formatting
 *
 * Format constraint values and build readable constraint messages
 */

export class ConstraintFormatter {
  formatConstraintValue(value) {
    if (Array.isArray(value)) {
      return '[' + value.map(v => "'" + String(v) + "'").join(', ') + ']';
    }
    if (typeof value === 'string') {
      return "'" + value + "'";
    }
    return String(value);
  }

  buildConstraintMessage(constraint) {
    if (constraint.type === 'enum') {
      return 'Expected one of: ' + constraint.enum.map(e => "'" + String(e) + "'").join(', ');
    }
    if (constraint.type === 'minLength') {
      return 'Minimum length: ' + constraint.minLength;
    }
    if (constraint.type === 'maxLength') {
      return 'Maximum length: ' + constraint.maxLength;
    }
    if (constraint.type === 'min') {
      return 'Minimum value: ' + constraint.min;
    }
    if (constraint.type === 'max') {
      return 'Maximum value: ' + constraint.max;
    }
    if (constraint.type === 'pattern') {
      return 'Must match pattern: ' + constraint.pattern;
    }
    return '';
  }
}
