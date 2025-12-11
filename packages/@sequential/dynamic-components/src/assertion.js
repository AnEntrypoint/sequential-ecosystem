// Fluent assertion API
import { AssertionError } from './assertion-error.js';

export class Assertion {
  constructor(value) {
    this.value = value;
  }

  toBe(expected) {
    if (this.value !== expected) {
      throw new AssertionError(`Expected ${expected} but got ${this.value}`);
    }
  }

  toEqual(expected) {
    if (JSON.stringify(this.value) !== JSON.stringify(expected)) {
      throw new AssertionError(
        `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(this.value)}`
      );
    }
  }

  toContain(substring) {
    if (!this.value.includes(substring)) {
      throw new AssertionError(`Expected to contain ${substring}`);
    }
  }

  toHaveLength(length) {
    if (this.value.length !== length) {
      throw new AssertionError(`Expected length ${length} but got ${this.value.length}`);
    }
  }

  toBeGreaterThan(threshold) {
    if (this.value <= threshold) {
      throw new AssertionError(`Expected ${this.value} to be greater than ${threshold}`);
    }
  }

  toBeLessThan(threshold) {
    if (this.value >= threshold) {
      throw new AssertionError(`Expected ${this.value} to be less than ${threshold}`);
    }
  }

  toMatch(regex) {
    if (!regex.test(this.value)) {
      throw new AssertionError(`Expected ${this.value} to match ${regex}`);
    }
  }

  not() {
    return new NegatedAssertion(this.value);
  }
}

class NegatedAssertion extends Assertion {
  toBe(unexpected) {
    if (this.value === unexpected) {
      throw new AssertionError(`Expected not to be ${unexpected}`);
    }
  }

  toEqual(unexpected) {
    if (JSON.stringify(this.value) === JSON.stringify(unexpected)) {
      throw new AssertionError(`Expected not to equal ${JSON.stringify(unexpected)}`);
    }
  }

  toContain(substring) {
    if (this.value.includes(substring)) {
      throw new AssertionError(`Expected not to contain ${substring}`);
    }
  }
}
