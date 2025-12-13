// Landmark and semantic structure checks
export class LandmarkChecks {
  static checkLandmarks(component) {
    const issues = [];
    const type = component.type || '';

    if (['main', 'nav', 'footer', 'aside'].includes(type)) {
      if (!component['aria-role'] && !component['aria-label']) {
        issues.push({
          wcag: '1.3.1',
          level: 'A',
          type: 'missing-landmark',
          severity: 'warning',
          message: `Landmark <${type}> should have aria-label or aria-role`,
          element: component
        });
      }
    }

    return issues;
  }

  static checkHeadingStructure(component, depth) {
    const issues = [];

    if (component.type?.match(/^h[1-6]$/)) {
      const level = parseInt(component.type[1]);

      if (level > 1 && depth > 0) {
        const expectedMaxLevel = depth + 1;
        if (level > expectedMaxLevel + 1) {
          issues.push({
            wcag: '1.3.1',
            level: 'A',
            type: 'improper-heading-hierarchy',
            severity: 'warning',
            message: `Heading hierarchy skipped levels (expected ${expectedMaxLevel}, got ${level})`,
            element: component
          });
        }
      }
    }

    return issues;
  }

  static checkLanguage(component) {
    const issues = [];

    if (!component.lang && component.type === 'html') {
      issues.push({
        wcag: '3.1.1',
        level: 'A',
        type: 'missing-language',
        severity: 'warning',
        message: 'Document language not specified',
        element: component,
        suggestion: 'Add lang="en" to <html> element'
      });
    }

    return issues;
  }
}
