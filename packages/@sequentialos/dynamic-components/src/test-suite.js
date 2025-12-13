/**
 * test-suite.js - Pattern Test Suite Facade
 *
 * Delegates to focused modules:
 * - test-management: Test and suite registration
 * - test-execution: Test execution engine
 * - test-reporting: Report generation
 * - test-snapshots: Snapshot testing
 */

import { TestManagement } from './test-management.js';
import { TestExecutionEngine } from './test-execution.js';
import { TestReporting } from './test-reporting.js';
import { SnapshotManager } from './test-snapshots.js';

export class PatternTestSuite {
  constructor(patternId) {
    this.patternId = patternId;
    this.management = new TestManagement();
    this.execution = new TestExecutionEngine(patternId);
    this.reporting = new TestReporting(patternId);
    this.snapshots = new SnapshotManager();
  }

  describe(description, callback) {
    return this.management.describe(description, callback);
  }

  test(testName, testFn) {
    this.management.addTest(testName, testFn);
  }

  get test() {
    const self = this;
    const testFn = (testName, fn) => self.management.addTest(testName, fn);
    testFn.skip = (testName, fn) => self.management.addSkipTest(testName, fn);
    return testFn;
  }

  async run() {
    const tests = this.management.getTests();
    return await this.execution.run(tests);
  }

  getResults() {
    return this.execution.getResults();
  }

  generateReport(format = 'text') {
    const results = this.execution.getResults();
    return this.reporting.generateReport(results, format);
  }

  snapshotTest(name, component) {
    return this.snapshots.snapshotTest(name, component);
  }
}
