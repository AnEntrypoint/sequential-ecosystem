// Content accessibility checks (aria, alt text, labels)
export class ContentChecks {
  static checkAriaAttributes(component) {
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

  static checkAltText(component) {
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

  static checkColorContrast(component, calculateContrast) {
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
}
