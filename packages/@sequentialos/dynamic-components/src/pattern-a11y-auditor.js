// Facade maintaining 100% backward compatibility
import { A11yChecker } from './a11y-checker.js';
import { A11yUtils } from './a11y-utils.js';
import { A11yReporter } from './a11y-reporter.js';

class AccessibilityAuditor {
  constructor() {
    this.auditResults = [];
    this.wcagGuidelines = new Map();
    this.componentIssues = new Map();
    this.checker = new A11yChecker();
    this.utils = new A11yUtils();
    this.reporter = new A11yReporter(this.utils);
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

    issues.push(...this.checker.checkLandmarks(componentDef));
    issues.push(...this.checker.checkAriaAttributes(componentDef));
    issues.push(...this.checker.checkColorContrast(componentDef, (bg, fg) => this.utils.calculateContrast(bg, fg)));
    issues.push(...this.checker.checkInteractiveElements(componentDef));
    issues.push(...this.checker.checkFormElements(componentDef));
    issues.push(...this.checker.checkHeadingStructure(componentDef, depth));
    issues.push(...this.checker.checkAltText(componentDef));
    issues.push(...this.checker.checkFocusManagement(componentDef));
    issues.push(...this.checker.checkLanguage(componentDef));
    issues.push(...this.checker.checkMotion(componentDef));

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

  calculateContrast(bgColor, fgColor) {
    return this.utils.calculateContrast(bgColor, fgColor);
  }

  getLuminance(color) {
    return this.utils.getLuminance(color);
  }

  getSeverityCount(issues) {
    return this.utils.getSeverityCount(issues);
  }

  getWCAGComplianceLevel(issues) {
    return this.utils.getWCAGComplianceLevel(issues);
  }

  buildAuditReport(issues) {
    return this.utils.buildAuditReport(issues);
  }

  buildAuditUI(issues) {
    return this.reporter.buildAuditUI(issues);
  }

  buildIssueCard(label, count, color) {
    return this.reporter.buildIssueCard(label, count, color);
  }

  exportAuditReport() {
    return this.reporter.exportAuditReport(this.componentIssues, this.wcagGuidelines);
  }
}

function createAccessibilityAuditor() {
  return new AccessibilityAuditor();
}

export { AccessibilityAuditor, createAccessibilityAuditor };
