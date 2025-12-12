/**
 * test-management.js - Test definition and organization
 *
 * Manages test and suite registration
 */

export class TestManagement {
  constructor() {
    this.tests = [];
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

  addTest(testName, testFn) {
    this.tests.push({
      name: testName,
      fn: testFn,
      suite: null,
      skipped: false
    });
  }

  addSkipTest(testName, testFn) {
    this.tests.push({
      name: testName,
      fn: testFn,
      skipped: true
    });
  }

  getTests() {
    return this.tests;
  }
}
