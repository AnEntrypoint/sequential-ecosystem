// Test context and assertions
import { AssertionError } from './assertion-error.js';

export class TestContext {
  constructor() {
    this.assertions = [];
  }

  assert(condition, message) {
    if (!condition) {
      throw new AssertionError(message || 'Assertion failed');
    }
    this.assertions.push({ condition: true, message });
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new AssertionError(
        message || `Expected ${expected} but got ${actual}`
      );
    }
  }

  assertNotEqual(actual, unexpected, message) {
    if (actual === unexpected) {
      throw new AssertionError(
        message || `Expected value to not be ${unexpected}`
      );
    }
  }

  assertDeepEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new AssertionError(
        message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
      );
    }
  }

  assertTruthy(value, message) {
    if (!value) {
      throw new AssertionError(message || `Expected truthy value but got ${value}`);
    }
  }

  assertFalsy(value, message) {
    if (value) {
      throw new AssertionError(message || `Expected falsy value but got ${value}`);
    }
  }

  assertExists(value, message) {
    if (value === null || value === undefined) {
      throw new AssertionError(message || 'Expected value to exist');
    }
  }

  assertNull(value, message) {
    if (value !== null) {
      throw new AssertionError(message || `Expected null but got ${value}`);
    }
  }

  assertThrows(fn, ErrorType, message) {
    try {
      fn();
      throw new AssertionError(message || 'Expected function to throw');
    } catch (e) {
      if (ErrorType && !(e instanceof ErrorType)) {
        throw new AssertionError(
          message || `Expected ${ErrorType.name} but got ${e.constructor.name}`
        );
      }
    }
  }

  assertArrayIncludes(array, value, message) {
    if (!array.includes(value)) {
      throw new AssertionError(
        message || `Expected array to include ${value}`
      );
    }
  }

  assertObjectHasKey(obj, key, message) {
    if (!(key in obj)) {
      throw new AssertionError(message || `Expected object to have key ${key}`);
    }
  }

  assertEquals(a, b, message) {
    this.assertEqual(a, b, message);
  }

  assertTrue(value, message) {
    this.assertTruthy(value, message);
  }

  assertFalse(value, message) {
    this.assertFalsy(value, message);
  }

  fail(message) {
    throw new AssertionError(message || 'Test failed');
  }
}
