// Accessibility issue checkers for WCAG compliance
export class A11yChecker {
  checkLandmarks(component) {
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

  checkAriaAttributes(component) {
    const issues = [];

    if (!component['aria-label'] && !component['aria-labelledby']) {
      if (component.type === 'button' || component.type === 'a') {
        if (!component.content && !component.children) {
          issues.push({
            wcag: '4.1.2',
            level: 'A',
            type: 'missing-accessible-name',
            severity: 'error',
            message: `Interactive element <${component.type}> must have accessible name`,
            element: component
          });
        }
      }
    }

    if (component['aria-role'] === 'img' && !component['aria-label']) {
      issues.push({
        wcag: '1.1.1',
        level: 'A',
        type: 'missing-image-alt',
        severity: 'error',
        message: 'Image must have aria-label',
        element: component
      });
    }

    if (component.type === 'input' && !component['aria-label'] && !component.label) {
      issues.push({
        wcag: '4.1.2',
        level: 'A',
        type: 'missing-input-label',
        severity: 'error',
        message: 'Form input must have associated label',
        element: component
      });
    }

    return issues;
  }

  checkColorContrast(component, calculateContrast) {
    const issues = [];
    const style = component.style || {};

    const hasBackground = style.background || style.backgroundColor;
    const hasColor = style.color;
    const hasContent = component.content || component.children;

    if (hasBackground && hasColor && hasContent) {
      const contrast = calculateContrast(
        style.background || style.backgroundColor,
        style.color
      );

      if (contrast < 4.5) {
        issues.push({
          wcag: '1.4.3',
          level: 'AA',
          type: 'low-contrast',
          severity: 'warning',
          message: `Contrast ratio ${contrast.toFixed(2)}:1 is below 4.5:1 minimum`,
          element: component,
          details: { contrast, minimum: 4.5 }
        });
      }
    }

    return issues;
  }

  checkInteractiveElements(component) {
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

  checkFormElements(component) {
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

  checkHeadingStructure(component, depth) {
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

  checkAltText(component) {
    const issues = [];

    if (component.type === 'img' && !component.alt) {
      issues.push({
        wcag: '1.1.1',
        level: 'A',
        type: 'missing-alt-text',
        severity: 'error',
        message: 'Image must have alt text',
        element: component
      });
    }

    return issues;
  }

  checkFocusManagement(component) {
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
          suggestion: `Replace with <button> or <a> and add aria-label`
        });
      }
    }

    return issues;
  }

  checkLanguage(component) {
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

  checkMotion(component) {
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
