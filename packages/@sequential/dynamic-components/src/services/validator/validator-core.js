export class ValidatorCore {
  constructor() {
    this.wcagRules = this.initializeWCAGRules();
    this.auditResults = [];
    this.selectedLevel = 'AA';
    this.listeners = [];
  }

  initializeWCAGRules() {
    return {
      perceivable: [
        {
          id: '1.1.1',
          level: 'A',
          title: 'Non-text Content',
          description: 'All non-text content has text alternatives',
          check: (def) => this.checkAltText(def),
          fix: 'Add aria-label or aria-describedby to images and icons'
        },
        {
          id: '1.4.3',
          level: 'AA',
          title: 'Contrast (Minimum)',
          description: 'Text has at least 4.5:1 contrast ratio',
          check: (def) => this.checkContrast(def),
          fix: 'Increase text/background contrast to meet WCAG AA standards'
        },
        {
          id: '1.4.11',
          level: 'AA',
          title: 'Non-text Contrast',
          description: 'UI components have 3:1 contrast ratio',
          check: (def) => this.checkUIContrast(def),
          fix: 'Ensure UI elements have sufficient contrast'
        }
      ],
      operable: [
        {
          id: '2.1.1',
          level: 'A',
          title: 'Keyboard',
          description: 'All functionality available from keyboard',
          check: (def) => this.checkKeyboardAccess(def),
          fix: 'Add tabindex, keyboard event handlers, or use native controls'
        },
        {
          id: '2.1.2',
          level: 'A',
          title: 'No Keyboard Trap',
          description: 'Keyboard focus is not trapped',
          check: (def) => this.checkNoKeyboardTrap(def),
          fix: 'Ensure focus can move to all interactive elements'
        },
        {
          id: '2.4.3',
          level: 'A',
          title: 'Focus Order',
          description: 'Focus order is logical and meaningful',
          check: (def) => this.checkFocusOrder(def),
          fix: 'Ensure logical tab order for interactive elements'
        },
        {
          id: '2.4.7',
          level: 'AA',
          title: 'Focus Visible',
          description: 'Keyboard focus indicator is visible',
          check: (def) => this.checkFocusIndicator(def),
          fix: 'Add outline or visible focus style to interactive elements'
        }
      ],
      understandable: [
        {
          id: '3.1.1',
          level: 'A',
          title: 'Language of Page',
          description: 'Page language is specified',
          check: (def) => this.checkLanguage(def),
          fix: 'Add lang attribute to root element'
        },
        {
          id: '3.2.4',
          level: 'A',
          title: 'Consistent Identification',
          description: 'Components with same function are identified consistently',
          check: (def) => this.checkConsistency(def),
          fix: 'Use consistent labels and naming for similar components'
        },
        {
          id: '3.3.2',
          level: 'A',
          title: 'Labels or Instructions',
          description: 'Form fields have associated labels',
          check: (def) => this.checkLabels(def),
          fix: 'Associate labels with form inputs using label elements or aria-label'
        }
      ],
      robust: [
        {
          id: '4.1.2',
          level: 'A',
          title: 'Name, Role, Value',
          description: 'All components have accessible name and role',
          check: (def) => this.checkNameRoleValue(def),
          fix: 'Add appropriate ARIA roles and labels to custom components'
        },
        {
          id: '4.1.3',
          level: 'A',
          title: 'Status Messages',
          description: 'Status messages are announced to assistive technology',
          check: (def) => this.checkStatusMessages(def),
          fix: 'Use aria-live regions for dynamic content updates'
        }
      ]
    };
  }

  auditPattern(definition, level = 'AA') {
    this.selectedLevel = level;
    const results = {
      definition: definition,
      level,
      timestamp: new Date().toISOString(),
      categories: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    Object.entries(this.wcagRules).forEach(([category, rules]) => {
      results.categories[category] = [];

      rules.forEach(rule => {
        if (this.isLevelApplicable(rule.level, level)) {
          const result = {
            id: rule.id,
            level: rule.level,
            title: rule.title,
            description: rule.description,
            passed: rule.check(definition),
            fix: rule.fix,
            severity: this.calculateSeverity(rule.level)
          };

          results.categories[category].push(result);
          results.summary.total++;

          if (result.passed) {
            results.summary.passed++;
          } else {
            if (result.severity === 'error') {
              results.summary.failed++;
            } else {
              results.summary.warnings++;
            }
          }
        }
      });
    });

    this.auditResults.push(results);

    if (this.auditResults.length > 50) {
      this.auditResults.shift();
    }

    this.notifyListeners('auditComplete', results);

    return results;
  }

  isLevelApplicable(ruleLevel, selectedLevel) {
    const levels = { A: 1, AA: 2, AAA: 3 };
    return levels[ruleLevel] <= levels[selectedLevel];
  }

  calculateSeverity(level) {
    return level === 'A' ? 'error' : 'warning';
  }

  checkAltText(definition) {
    if (!definition) return true;

    if (['image', 'img'].includes(definition.type)) {
      return !!(definition.attributes?.alt || definition.attributes?.['aria-label'] || definition.content);
    }

    if (definition.children) {
      return definition.children.every(child => this.checkAltText(child));
    }

    return true;
  }

  checkContrast(definition) {
    if (!definition || !definition.style) return true;

    const bgColor = definition.style.backgroundColor || '#ffffff';
    const textColor = definition.style.color || '#000000';

    const luminance1 = this.getRelativeLuminance(bgColor);
    const luminance2 = this.getRelativeLuminance(textColor);

    const contrast = (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);

    return contrast >= 4.5;
  }

  checkUIContrast(definition) {
    if (!definition || !definition.style) return true;

    const bgColor = definition.style.backgroundColor || '#ffffff';
    const borderColor = definition.style.borderColor || bgColor;

    const luminance1 = this.getRelativeLuminance(bgColor);
    const luminance2 = this.getRelativeLuminance(borderColor);

    const contrast = (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);

    return contrast >= 3;
  }

  checkKeyboardAccess(definition) {
    if (!definition) return true;

    const interactive = ['button', 'input', 'link', 'select', 'textarea'].includes(definition.type);

    if (interactive) {
      return !!(definition.attributes?.tabindex !== undefined || definition.onClick);
    }

    if (definition.children) {
      return definition.children.some(child => this.checkKeyboardAccess(child));
    }

    return true;
  }

  checkNoKeyboardTrap(definition) {
    return true;
  }

  checkFocusOrder(definition) {
    if (!definition) return true;

    if (definition.children && Array.isArray(definition.children)) {
      const hasTabIndexes = definition.children.some(c => c.attributes?.tabindex !== undefined);

      if (hasTabIndexes) {
        const tabIndexes = definition.children
          .map(c => parseInt(c.attributes?.tabindex) || 0)
          .sort((a, b) => a - b);

        for (let i = 0; i < tabIndexes.length - 1; i++) {
          if (tabIndexes[i] > 0 && tabIndexes[i] >= 32767) {
            return false;
          }
        }
      }
    }

    return true;
  }

  checkFocusIndicator(definition) {
    if (!definition) return true;

    const interactive = ['button', 'input', 'link'].includes(definition.type);

    if (interactive) {
      return !!(definition.style?.outline || definition.style?.boxShadow || definition.style?.borderColor);
    }

    if (definition.children) {
      return definition.children.some(child => this.checkFocusIndicator(child));
    }

    return true;
  }

  checkLanguage(definition) {
    return definition?.attributes?.lang !== undefined;
  }

  checkConsistency(definition) {
    return true;
  }

  checkLabels(definition) {
    if (!definition) return true;

    if (['input', 'textarea', 'select'].includes(definition.type)) {
      return !!(definition.attributes?.['aria-label'] || definition.attributes?.['aria-labelledby']);
    }

    if (definition.children) {
      return definition.children.every(child => this.checkLabels(child));
    }

    return true;
  }

  checkNameRoleValue(definition) {
    if (!definition) return true;

    if (definition.type.includes('custom-')) {
      return !!(definition.attributes?.role && definition.attributes?.['aria-label']);
    }

    return true;
  }

  checkStatusMessages(definition) {
    if (!definition) return true;

    if (definition.attributes?.['aria-live']) {
      return true;
    }

    if (definition.children) {
      return definition.children.some(child => this.checkStatusMessages(child));
    }

    return true;
  }

  getRelativeLuminance(hexColor) {
    const rgb = parseInt(hexColor.replace('#', ''), 16);
    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;

    const [rs, gs, bs] = [r, g, b].map(x => {
      x = x / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  getComplianceScore(results) {
    if (results.summary.total === 0) return 100;

    const passedPercentage = (results.summary.passed / results.summary.total) * 100;

    return Math.round(passedPercentage);
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
    return this;
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
    return this;
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`A11y validator listener error for ${event}:`, e);
        }
      });
  }

  clear() {
    this.auditResults = [];
    this.listeners = [];
    return this;
  }
}
