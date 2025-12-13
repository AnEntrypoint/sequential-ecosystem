/**
 * test-execution.js - Test execution engine
 *
 * Runs tests and collects results
 */

import { TestContext } from './test-context.js';

export class TestExecutionEngine {
  constructor(patternId) {
    this.patternId = patternId;
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
  }

  async run(tests) {
    const startTime = performance.now();
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;

    for (const test of tests) {
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
}
