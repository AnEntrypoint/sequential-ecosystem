class PatternTestSuite {
  constructor(patternId) {
    this.patternId = patternId;
    this.tests = [];
    this.results = [];
    this.snapshots = new Map();
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
  }

  describe(description, callback) {
    const suite = {
      description,
      tests: [],
      passed: 0,
      failed: 0
    };

    const it = (testName, testFn) => {
      suite.tests.push({
        name: testName,
        fn: testFn,
        skipped: false
      });
    };

    it.skip = (testName, testFn) => {
      suite.tests.push({
        name: testName,
        fn: testFn,
        skipped: true
      });
    };

    callback(it);
    return suite;
  }

  test(testName, testFn) {
    this.tests.push({
      name: testName,
      fn: testFn,
      suite: null,
      skipped: false
    });
  }

  test.skip = (testName, testFn) => {
    this.tests.push({
      name: testName,
      fn: testFn,
      skipped: true
    });
  };

  addAssertion(assertion) {
    return new Assertion(assertion);
  }

  async run() {
    const startTime = performance.now();
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;

    for (const test of this.tests) {
      if (test.skipped) {
        this.skippedTests++;
        this.results.push({
          name: test.name,
          status: 'skipped',
          message: 'Test skipped'
        });
        continue;
      }

      this.totalTests++;

      try {
        const context = new TestContext();
        await test.fn(context);

        this.passedTests++;
        this.results.push({
          name: test.name,
          status: 'passed',
          duration: performance.now() - startTime
        });
      } catch (error) {
        this.failedTests++;
        this.results.push({
          name: test.name,
          status: 'failed',
          message: error.message,
          stack: error.stack
        });
      }
    }

    return {
      patternId: this.patternId,
      totalTests: this.totalTests,
      passedTests: this.passedTests,
      failedTests: this.failedTests,
      skippedTests: this.skippedTests,
      duration: performance.now() - startTime,
      passRate: this.totalTests > 0 ? (this.passedTests / this.totalTests) * 100 : 0,
      results: this.results
    };
  }

  getResults() {
    return {
      summary: {
        patternId: this.patternId,
        totalTests: this.totalTests,
        passed: this.passedTests,
        failed: this.failedTests,
        skipped: this.skippedTests,
        passRate: this.totalTests > 0 ? (this.passedTests / this.totalTests) * 100 : 0
      },
      results: this.results
    };
  }

  generateReport(format = 'text') {
    if (format === 'json') {
      return JSON.stringify(this.getResults(), null, 2);
    }

    let report = `\n=== Test Results: ${this.patternId} ===\n\n`;
    report += `Total: ${this.totalTests} | Passed: ${this.passedTests} | Failed: ${this.failedTests} | Skipped: ${this.skippedTests}\n`;
    report += `Pass Rate: ${((this.passedTests / Math.max(this.totalTests, 1)) * 100).toFixed(1)}%\n\n`;

    this.results.forEach((result, idx) => {
      const icon = result.status === 'passed' ? '✓' : result.status === 'failed' ? '✗' : '⊘';
      report += `${idx + 1}. ${icon} ${result.name}\n`;

      if (result.message) {
        report += `   Error: ${result.message}\n`;
      }
    });

    report += '\n';
    return report;
  }

  snapshotTest(name, component) {
    const snapshot = JSON.stringify(component);
    const hash = this.hashString(snapshot);

    if (!this.snapshots.has(name)) {
      this.snapshots.set(name, { snapshot, hash });
      return { created: true, hash };
    }

    const stored = this.snapshots.get(name);
    if (stored.hash === hash) {
      return { matched: true };
    }

    return { matched: false, expected: stored.hash, actual: hash };
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}

class TestContext {
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

class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AssertionError';
  }
}

class Assertion {
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

function createPatternTestSuite(patternId) {
  return new PatternTestSuite(patternId);
}

export { PatternTestSuite, TestContext, AssertionError, Assertion, createPatternTestSuite };
