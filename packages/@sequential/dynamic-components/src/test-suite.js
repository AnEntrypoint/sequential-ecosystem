// Test suite orchestration and execution
import { TestContext } from './test-context.js';

export class PatternTestSuite {
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

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
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
}
