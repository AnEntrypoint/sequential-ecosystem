/**
 * test-reporting.js - Test result reporting
 *
 * Generates test reports in different formats
 */

export class TestReporting {
  constructor(patternId) {
    this.patternId = patternId;
  }

  generateReport(results, format = 'text') {
    if (format === 'json') {
      return JSON.stringify({
        summary: {
          patternId: this.patternId,
          totalTests: results.totalTests,
          passed: results.passedTests,
          failed: results.failedTests,
          skipped: results.skippedTests,
          passRate: results.passRate
        },
        results: results.results
      }, null, 2);
    }

    let report = `\n=== Test Results: ${this.patternId} ===\n\n`;
    report += `Total: ${results.totalTests} | Passed: ${results.passedTests} | Failed: ${results.failedTests} | Skipped: ${results.skippedTests}\n`;
    report += `Pass Rate: ${((results.passedTests / Math.max(results.totalTests, 1)) * 100).toFixed(1)}%\n\n`;

    results.results.forEach((result, idx) => {
      const icon = result.status === 'passed' ? '✓' : result.status === 'failed' ? '✗' : '⊘';
      report += `${idx + 1}. ${icon} ${result.name}\n`;

      if (result.message) {
        report += `   Error: ${result.message}\n`;
      }
    });

    report += '\n';
    return report;
  }
}
