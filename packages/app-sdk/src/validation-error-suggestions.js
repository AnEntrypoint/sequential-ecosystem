export function createValidationErrorSuggestions() {
  return {
    formatConstraintValue(value) {
      if (Array.isArray(value)) {
        return '[' + value.map(v => "'" + String(v) + "'").join(', ') + ']';
      }
      if (typeof value === 'string') {
        return "'" + value + "'";
      }
      return String(value);
    },

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
    },

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
        suggestion = fieldName + ' must be one of: ' + values + '. Got: ' + this.formatConstraintValue(attemptedValue);
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
        suggestion = fieldName + ' must match pattern ' + constraints.pattern + '. Got: ' + this.formatConstraintValue(attemptedValue);
      }

      error.enhancedMessage = suggestion;
      error.constraints = constraints;
      error.attemptedValue = attemptedValue;

      return error;
    },

    validateWithSuggestions(value, fieldName, schema) {
      const errors = [];

      if (schema.required && (value === undefined || value === null)) {
        errors.push(this.enhanceValidationError(
          { message: 'Required field', reason: 'required' },
          fieldName,
          schema,
          value
        ));
      }

      if (value === undefined || value === null) {
        return { valid: errors.length === 0, errors: errors };
      }

      if (schema.type && typeof value !== schema.type) {
        errors.push(this.enhanceValidationError(
          { message: 'Type mismatch', reason: 'type' },
          fieldName,
          schema,
          value
        ));
        return { valid: false, errors: errors };
      }

      if (schema.enum && !schema.enum.includes(value)) {
        errors.push(this.enhanceValidationError(
          { message: 'Invalid enum value', reason: 'enum' },
          fieldName,
          schema,
          value
        ));
      }

      if (schema.minLength && typeof value === 'string' && value.length < schema.minLength) {
        errors.push(this.enhanceValidationError(
          { message: 'String too short', reason: 'minLength' },
          fieldName,
          schema,
          value
        ));
      }

      if (schema.maxLength && typeof value === 'string' && value.length > schema.maxLength) {
        errors.push(this.enhanceValidationError(
          { message: 'String too long', reason: 'maxLength' },
          fieldName,
          schema,
          value
        ));
      }

      if (schema.min && typeof value === 'number' && value < schema.min) {
        errors.push(this.enhanceValidationError(
          { message: 'Number too small', reason: 'min' },
          fieldName,
          schema,
          value
        ));
      }

      if (schema.max && typeof value === 'number' && value > schema.max) {
        errors.push(this.enhanceValidationError(
          { message: 'Number too large', reason: 'max' },
          fieldName,
          schema,
          value
        ));
      }

      if (schema.pattern && typeof value === 'string') {
        const regex = new RegExp(schema.pattern);
        if (!regex.test(value)) {
          errors.push(this.enhanceValidationError(
            { message: 'Pattern mismatch', reason: 'pattern' },
            fieldName,
            schema,
            value
          ));
        }
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    formatErrorSummary(fieldErrors) {
      const messages = fieldErrors.map(function(err) {
        return err.enhancedMessage || err.message;
      });
      return messages.join('; ');
    }
  };
}
