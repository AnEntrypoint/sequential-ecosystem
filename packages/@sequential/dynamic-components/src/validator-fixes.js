// Validation fixes and suggestions
export class ValidatorFixes {
  suggestFixes(component, validationDetails) {
    const issues = validationDetails.filter(d => !d.valid);
    const suggestions = [];

    issues.forEach(issue => {
      switch (issue.rule) {
        case 'required-type':
          suggestions.push({
            issue: issue.rule,
            suggestion: 'Add a type property to the component',
            fix: { type: 'box' }
          });
          break;

        case 'reasonable-dimensions':
          suggestions.push({
            issue: issue.rule,
            suggestion: 'Adjust width/height to reasonable values',
            fix: { style: { width: '100px', height: '50px' } }
          });
          break;

        case 'accessible-text':
          suggestions.push({
            issue: issue.rule,
            suggestion: 'Add aria-label for screen readers',
            fix: { 'aria-label': 'Descriptive label' }
          });
          break;
      }
    });

    return suggestions;
  }

  exportValidationReport(validationResults) {
    return {
      generated: new Date().toISOString(),
      validationResults,
      summary: {
        total: validationResults.length,
        passed: validationResults.filter(r => r.valid).length,
        failed: validationResults.filter(r => !r.valid).length
      }
    };
  }
}
