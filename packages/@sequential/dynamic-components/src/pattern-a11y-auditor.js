class AccessibilityAuditor {
  constructor() {
    this.auditResults = [];
    this.wcagGuidelines = new Map();
    this.componentIssues = new Map();
    this.initializeGuidelines();
  }

  initializeGuidelines() {
    this.wcagGuidelines.set('1.1.1', {
      level: 'A',
      title: 'Non-text Content',
      description: 'All non-text content must have text alternative'
    });

    this.wcagGuidelines.set('1.4.3', {
      level: 'AA',
      title: 'Contrast (Minimum)',
      description: 'Text and interactive elements must have 4.5:1 contrast ratio'
    });

    this.wcagGuidelines.set('2.1.1', {
      level: 'A',
      title: 'Keyboard',
      description: 'All functionality available from keyboard'
    });

    this.wcagGuidelines.set('2.1.2', {
      level: 'A',
      title: 'No Keyboard Trap',
      description: 'Keyboard focus must not be trapped'
    });

    this.wcagGuidelines.set('2.4.3', {
      level: 'A',
      title: 'Focus Order',
      description: 'Focus order must be logical'
    });

    this.wcagGuidelines.set('2.4.7', {
      level: 'AA',
      title: 'Focus Visible',
      description: 'Keyboard focus indicator must be visible'
    });

    this.wcagGuidelines.set('3.2.4', {
      level: 'AA',
      title: 'Consistent Identification',
      description: 'Components with same functionality must be identified consistently'
    });

    this.wcagGuidelines.set('4.1.2', {
      level: 'A',
      title: 'Name, Role, Value',
      description: 'All UI components must have accessible name, role, state, and value'
    });
  }

  audit(componentDef, depth = 0, parent = null) {
    const issues = [];

    issues.push(...this.checkLandmarks(componentDef));
    issues.push(...this.checkAriaAttributes(componentDef));
    issues.push(...this.checkColorContrast(componentDef));
    issues.push(...this.checkInteractiveElements(componentDef));
    issues.push(...this.checkFormElements(componentDef));
    issues.push(...this.checkHeadingStructure(componentDef, depth));
    issues.push(...this.checkAltText(componentDef));
    issues.push(...this.checkFocusManagement(componentDef));
    issues.push(...this.checkLanguage(componentDef));
    issues.push(...this.checkMotion(componentDef));

    const componentId = componentDef.id || `component-${Date.now()}`;
    this.componentIssues.set(componentId, {
      component: componentDef,
      issues,
      timestamp: Date.now()
    });

    if (componentDef.children) {
      const children = Array.isArray(componentDef.children) ? componentDef.children : [componentDef.children];
      children.forEach(child => {
        if (typeof child === 'object' && child !== null) {
          const childIssues = this.audit(child, depth + 1, componentDef);
          issues.push(...childIssues);
        }
      });
    }

    return issues;
  }

  checkLandmarks(component) {
    const issues = [];
    const landmarkRoles = ['main', 'navigation', 'contentinfo', 'search', 'complementary'];
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

  checkColorContrast(component) {
    const issues = [];
    const style = component.style || {};

    const hasBackground = style.background || style.backgroundColor;
    const hasColor = style.color;
    const hasContent = component.content || component.children;

    if (hasBackground && hasColor && hasContent) {
      const contrast = this.calculateContrast(
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

  calculateContrast(bgColor, fgColor) {
    const bgLum = this.getLuminance(bgColor);
    const fgLum = this.getLuminance(fgColor);

    const lighter = Math.max(bgLum, fgLum);
    const darker = Math.min(bgLum, fgLum);

    return parseFloat(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
  }

  getLuminance(color = '#ffffff') {
    if (!color || color === 'transparent') return 0;

    const hex = color.replace('#', '');
    const rgb = parseInt(hex, 16);

    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;

    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  getSeverityCount(issues) {
    return {
      error: issues.filter(i => i.severity === 'error').length,
      warning: issues.filter(i => i.severity === 'warning').length,
      info: issues.filter(i => i.severity === 'info').length
    };
  }

  getWCAGComplianceLevel(issues) {
    const levels = issues.map(i => i.level);

    if (levels.includes('error')) return 'Non-compliant';
    if (levels.some(l => l === 'A')) return 'Level A';
    if (levels.some(l => l === 'AA')) return 'Level AA';
    if (levels.some(l => l === 'AAA')) return 'Level AAA';

    return 'Compliant';
  }

  buildAuditReport(issues) {
    const counts = this.getSeverityCount(issues);
    const wcagLevel = this.getWCAGComplianceLevel(issues);

    return {
      timestamp: Date.now(),
      wcagLevel,
      totalIssues: issues.length,
      bySeverity: counts,
      issues: issues.sort((a, b) => {
        const severityOrder = { error: 0, warning: 1, info: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
    };
  }

  buildAuditUI(issues) {
    const report = this.buildAuditReport(issues);
    const counts = report.bySeverity;

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
          content: '♿ Accessibility Audit',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
        },
        {
          type: 'box',
          style: {
            padding: '8px 12px',
            background: '#2d2d30',
            borderRadius: '4px',
            borderLeft: `3px solid ${report.wcagLevel === 'Compliant' ? '#4ade80' : '#ef4444'}`
          },
          children: [{
            type: 'paragraph',
            content: `WCAG Level: ${report.wcagLevel}`,
            style: { margin: 0, fontSize: '10px', color: '#d4d4d4' }
          }]
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px'
          },
          children: [
            this.buildIssueCard('Errors', counts.error, '#ef4444'),
            this.buildIssueCard('Warnings', counts.warning, '#f59e0b'),
            this.buildIssueCard('Info', counts.info, '#3b82f6')
          ]
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxHeight: '200px',
            overflow: 'auto'
          },
          children: report.issues.slice(0, 5).map(issue => ({
            type: 'box',
            style: {
              padding: '6px 8px',
              background: '#3e3e42',
              borderLeft: `3px solid ${issue.severity === 'error' ? '#ef4444' : '#f59e0b'}`,
              borderRadius: '3px'
            },
            children: [{
              type: 'paragraph',
              content: `${issue.type}: ${issue.message}`,
              style: { margin: 0, fontSize: '8px', color: '#d4d4d4' }
            }]
          }))
        }
      ]
    };
  }

  buildIssueCard(label, count, color) {
    return {
      type: 'box',
      style: {
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

  exportAuditReport() {
    const issues = Array.from(this.componentIssues.values()).flatMap(c => c.issues);
    const report = this.buildAuditReport(issues);

    return {
      generated: new Date().toISOString(),
      report,
      guidelines: Array.from(this.wcagGuidelines.entries()).map(([code, info]) => ({
        code,
        ...info
      }))
    };
  }
}

function createAccessibilityAuditor() {
  return new AccessibilityAuditor();
}

export { AccessibilityAuditor, createAccessibilityAuditor };
