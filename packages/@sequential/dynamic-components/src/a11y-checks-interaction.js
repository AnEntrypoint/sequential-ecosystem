// Interactive element and keyboard accessibility checks
export class InteractionChecks {
  static checkInteractiveElements(component) {
    const issues = [];
    const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(component.type);

    if (isInteractive) {
      if (!component.tabindex && component.tabindex !== 0) {
        if (component.type !== 'button' && component.type !== 'a') {
          issues.push({
            wcag: '2.1.1',
            level: 'A',
            type: 'missing-tabindex',
            severity: 'warning',
            message: `Interactive element <${component.type}> should have tabindex`,
            element: component
          });
        }
      }

      if (component.style?.pointerEvents === 'none') {
        issues.push({
          wcag: '2.1.1',
          level: 'A',
          type: 'keyboard-trap',
          severity: 'error',
          message: 'Interactive element has pointer-events: none, preventing keyboard access',
          element: component
        });
      }
    }

    return issues;
  }

  static checkFocusManagement(component) {
    const issues = [];

    if (component.type === 'div' || component.type === 'span') {
      const isInteractive = component.onclick || component['on-click'];
      if (isInteractive && component.tabindex !== 0) {
        issues.push({
          wcag: '2.1.1',
          level: 'A',
          type: 'non-semantic-interactive',
          severity: 'warning',
          message: `Use semantic <button> or <a> instead of <${component.type}> for interactive elements`,
          element: component,
          suggestion: 'Replace with <button> or <a> and add aria-label'
        });
      }
    }

    return issues;
  }

  static checkFormElements(component) {
    const issues = [];

    if (component.type === 'form') {
      if (!component['aria-label'] && !component['aria-labelledby']) {
        issues.push({
          wcag: '4.1.2',
          level: 'A',
          type: 'missing-form-label',
          severity: 'warning',
          message: 'Form should have aria-label or aria-labelledby',
          element: component
        });
      }
    }

    if (component.type === 'input') {
      const required = component.required || component['aria-required'];
      if (required && !component['aria-required']) {
        issues.push({
          wcag: '4.1.2',
          level: 'A',
          type: 'missing-required-indicator',
          severity: 'warning',
          message: 'Required input should have aria-required="true"',
          element: component
        });
      }
    }

    return issues;
  }

  static checkMotion(component) {
    const issues = [];
    const animation = component.style?.animation;

    if (animation && animation.includes('infinite')) {
      issues.push({
        wcag: '2.3.3',
        level: 'AAA',
        type: 'animation-may-cause-seizure',
        severity: 'warning',
        message: 'Infinite animation may trigger vestibular disorder or seizures',
        element: component,
        suggestion: 'Limit animation duration or provide pause control'
      });
    }

    return issues;
  }
}
