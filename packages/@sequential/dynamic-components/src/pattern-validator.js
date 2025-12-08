class PatternValidator {
  constructor() {
    this.rules = new Map();
    this.customValidators = new Map();
    this.validationResults = [];
    this.initializeRules();
  }

  initializeRules() {
    this.addRule('required-type', (component) => {
      if (!component.type) {
        return { valid: false, message: 'Component type is required' };
      }
      return { valid: true };
    });

    this.addRule('valid-style', (component) => {
      if (!component.style) return { valid: true };

      const validCSSProps = ['width', 'height', 'padding', 'margin', 'background', 'color', 'display', 'flexDirection', 'gap'];
      const styleKeys = Object.keys(component.style);

      for (const key of styleKeys) {
        if (!validCSSProps.includes(key) && !key.startsWith('aria-') && !key.startsWith('data-')) {
          return { valid: false, message: `Invalid CSS property: ${key}` };
        }
      }

      return { valid: true };
    });

    this.addRule('valid-children', (component) => {
      if (!component.children) return { valid: true };

      if (Array.isArray(component.children)) {
        for (const child of component.children) {
          if (typeof child === 'string') {
            continue;
          }
          if (!child.type) {
            return { valid: false, message: 'Child component must have a type' };
          }
        }
      } else if (typeof component.children !== 'string' && !component.children.type) {
        return { valid: false, message: 'Child component must have a type' };
      }

      return { valid: true };
    });

    this.addRule('accessible-text', (component) => {
      if (!component.content && !component.children) {
        if (!component['aria-label'] && component.type !== 'container') {
          return { valid: false, message: 'Component should have content or aria-label', severity: 'warning' };
        }
      }
      return { valid: true };
    });

    this.addRule('color-contrast', (component) => {
      if (!component.style) return { valid: true };

      const hasBackground = component.style.background || component.style.backgroundColor;
      const hasColor = component.style.color;

      if (hasBackground && hasColor && component.content) {
        return { valid: true };
      }

      return { valid: true };
    });

    this.addRule('reasonable-dimensions', (component) => {
      if (!component.style) return { valid: true };

      const width = component.style.width;
      const height = component.style.height;

      if (width && typeof width === 'string') {
        const pxValue = parseInt(width);
        if (pxValue > 0 && pxValue < 10) {
          return { valid: false, message: `Width ${width} is too small`, severity: 'warning' };
        }
        if (pxValue > 10000) {
          return { valid: false, message: `Width ${width} is unreasonably large`, severity: 'warning' };
        }
      }

      return { valid: true };
    });
  }

  addRule(ruleName, validator) {
    this.rules.set(ruleName, validator);
  }

  addCustomValidator(name, fn) {
    this.customValidators.set(name, fn);
  }

  validate(component, ruleNames = null) {
    const results = [];
    const rulesToRun = ruleNames ? ruleNames : Array.from(this.rules.keys());

    rulesToRun.forEach(ruleName => {
      const rule = this.rules.get(ruleName);
      if (rule) {
        const result = rule(component);
        results.push({
          rule: ruleName,
          ...result,
          severity: result.severity || 'error'
        });
      }
    });

    Array.from(this.customValidators.values()).forEach(validator => {
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

  suggestFixes(component) {
    const issues = this.validate(component).details.filter(d => !d.valid);
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

  buildValidationUI() {
    const report = this.validationResults.length > 0
      ? this.getValidationReport({}, this.validationResults)
      : null;

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '✅ Validation',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
        },
        report ? {
          type: 'box',
          style: {
            display: 'flex',
            gap: '12px'
          },
          children: [
            this.buildStatusCard('Errors', report.errors, report.errors === 0 ? '#4ade80' : '#ef4444'),
            this.buildStatusCard('Warnings', report.warnings, report.warnings === 0 ? '#4ade80' : '#f59e0b')
          ]
        } : {
          type: 'paragraph',
          content: 'No validation performed',
          style: { margin: 0, fontSize: '10px', color: '#858585' }
        },
        report && report.details.length > 0 ? {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          },
          children: report.details.slice(0, 3).map(detail => ({
            type: 'box',
            style: {
              padding: '6px 8px',
              background: '#3e3e42',
              borderLeft: `3px solid ${detail.valid ? '#4ade80' : '#ef4444'}`,
              borderRadius: '3px'
            },
            children: [{
              type: 'paragraph',
              content: `${detail.rule}: ${detail.message}`,
              style: { margin: 0, fontSize: '8px', color: '#d4d4d4' }
            }]
          }))
        } : null
      ].filter(Boolean)
    };
  }

  buildStatusCard(label, count, color) {
    return {
      type: 'box',
      style: {
        flex: 1,
        padding: '8px 12px',
        background: '#2d2d30',
        borderRadius: '4px',
        borderTop: `3px solid ${color}`
      },
      children: [
        {
          type: 'paragraph',
          content: label,
          style: { margin: 0, fontSize: '9px', color: '#858585' }
        },
        {
          type: 'heading',
          content: String(count),
          level: 4,
          style: { margin: '4px 0 0 0', fontSize: '16px', color, fontWeight: 600 }
        }
      ]
    };
  }

  exportValidationReport() {
    return {
      generated: new Date().toISOString(),
      validationResults: this.validationResults,
      summary: {
        total: this.validationResults.length,
        passed: this.validationResults.filter(r => r.valid).length,
        failed: this.validationResults.filter(r => !r.valid).length
      }
    };
  }
}

function createPatternValidator() {
  return new PatternValidator();
}

export { PatternValidator, createPatternValidator };
