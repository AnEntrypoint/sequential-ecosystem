// Core validation engine
export class ValidatorEngine {
  constructor(rules) {
    this.rules = rules;
    this.validationResults = [];
  }

  validate(component, ruleNames = null) {
    const results = [];
    const rulesToRun = ruleNames ? ruleNames : this.rules.getAllRules();

    rulesToRun.forEach(ruleName => {
      const rule = this.rules.getRule(ruleName);
      if (rule) {
        const result = rule(component);
        results.push({
          rule: ruleName,
          ...result,
          severity: result.severity || 'error'
        });
      }
    });

    Array.from(this.rules.getCustomValidators().values()).forEach(validator => {
      const result = validator(component);
      if (!result.valid) {
        results.push(result);
      }
    });

    this.validationResults = results;
    return this.getValidationReport(component, results);
  }

  validateDeep(component, depth = 0) {
    const report = this.validate(component);

    if (component.children) {
      const children = Array.isArray(component.children) ? component.children : [component.children];

      children.forEach((child, idx) => {
        if (typeof child === 'object' && child !== null) {
          const childReport = this.validateDeep(child, depth + 1);
          report.childValidations = report.childValidations || [];
          report.childValidations.push(childReport);
        }
      });
    }

    return report;
  }

  getValidationReport(component, results) {
    const errors = results.filter(r => r.severity === 'error');
    const warnings = results.filter(r => r.severity === 'warning');

    return {
      component: {
        id: component.id,
        type: component.type
      },
      valid: errors.length === 0,
      errors: errors.length,
      warnings: warnings.length,
      details: results,
      timestamp: Date.now()
    };
  }

  findAllIssues(component) {
    const report = this.validateDeep(component);
    const allIssues = [...report.details];

    const collectIssues = (childReport) => {
      if (childReport.childValidations) {
        childReport.childValidations.forEach(cv => {
          allIssues.push(...cv.details);
          collectIssues(cv);
        });
      }
    };

    collectIssues(report);
    return allIssues.filter(issue => !issue.valid);
  }
}
