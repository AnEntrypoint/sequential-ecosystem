export class ValidationResult {
  constructor(isValid, errors = [], value = null) {
    this.isValid = isValid;
    this.errors = errors;
    this.value = value;
  }

  static ok(value) {
    return new ValidationResult(true, [], value);
  }

  static fail(errors) {
    const errorArray = Array.isArray(errors) ? errors : [errors];
    return new ValidationResult(false, errorArray, null);
  }

  addError(error) {
    this.errors.push(error);
    this.isValid = false;
    return this;
  }

  merge(other) {
    if (!other.isValid) {
      this.errors.push(...other.errors);
      this.isValid = false;
    }
    return this;
  }

  map(fn) {
    if (!this.isValid) return this;
    try {
      return ValidationResult.ok(fn(this.value));
    } catch (e) {
      return ValidationResult.fail(e.message);
    }
  }

  flatMap(fn) {
    if (!this.isValid) return this;
    try {
      const result = fn(this.value);
      return result instanceof ValidationResult ? result : ValidationResult.ok(result);
    } catch (e) {
      return ValidationResult.fail(e.message);
    }
  }

  getOrThrow() {
    if (this.isValid) return this.value;
    throw new Error(this.errors.join(', '));
  }

  getOr(defaultValue) {
    return this.isValid ? this.value : defaultValue;
  }

  toJSON() {
    return {
      isValid: this.isValid,
      errors: this.errors,
      value: this.isValid ? this.value : undefined
    };
  }
}
