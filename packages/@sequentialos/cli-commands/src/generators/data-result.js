/**
 * DataResult Monad
 * Error handling and transformation monad
 *
 * Delegates to:
 * - data-result-helpers: Utility functions for result wrapping
 */

import * as helpers from './data-result-helpers.js';

export class DataResult {
  constructor(value, error = null) {
    this.value = value;
    this.error = error;
    this.isError = error !== null;
  }

  static ok(value) {
    return new DataResult(value);
  }

  static err(error) {
    return new DataResult(null, error);
  }

  isOk() {
    return !this.isError;
  }

  map(fn) {
    if (this.isError) return this;
    try {
      return DataResult.ok(fn(this.value));
    } catch (error) {
      return DataResult.err(error);
    }
  }

  flatMap(fn) {
    if (this.isError) return this;
    try {
      const result = fn(this.value);
      return result instanceof DataResult ? result : DataResult.ok(result);
    } catch (error) {
      return DataResult.err(error);
    }
  }

  filter(predicate, errorMsg = 'Filter condition not met') {
    if (this.isError) return this;
    if (predicate(this.value)) return this;
    return DataResult.err(new Error(errorMsg));
  }

  transform(fn) {
    return this.flatMap(fn);
  }

  getOrThrow() {
    if (this.isError) throw this.error;
    return this.value;
  }

  getOrElse(defaultValue) {
    if (this.isError) return defaultValue;
    return this.value;
  }

  unwrap() {
    return { value: this.value, error: this.error, isError: this.isError };
  }
}

export const wrapResult = (value) => helpers.wrapResult(value, DataResult);
export const wrapError = (error) => helpers.wrapError(error, DataResult);
