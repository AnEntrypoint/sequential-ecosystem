// Validator core facade - maintains 100% backward compatibility
import { WCAGRules } from '../../wcag-rules.js';
import { ValidatorChecks } from './validator-checks.js';
import { ValidatorUtils } from './validator-utils.js';

export class ValidatorCore {
  constructor() {
    this.utils = new ValidatorUtils();
    this.checks = new ValidatorChecks(this.utils);
    this.wcagRules = new WCAGRules(this.checks);
    this.auditResults = [];
    this.selectedLevel = 'AA';
    this.listeners = [];
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

    Object.entries(this.wcagRules.getRules()).forEach(([category, rules]) => {
      results.categories[category] = [];

      rules.forEach(rule => {
        if (this.utils.isLevelApplicable(rule.level, level)) {
          const result = {
            id: rule.id,
            level: rule.level,
            title: rule.title,
            description: rule.description,
            passed: rule.check(definition),
            fix: rule.fix,
            severity: this.utils.calculateSeverity(rule.level)
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
    return this.utils.isLevelApplicable(ruleLevel, selectedLevel);
  }

  calculateSeverity(level) {
    return this.utils.calculateSeverity(level);
  }

  checkAltText(definition) {
    return this.checks.checkAltText(definition);
  }

  checkContrast(definition) {
    return this.checks.checkContrast(definition);
  }

  checkUIContrast(definition) {
    return this.checks.checkUIContrast(definition);
  }

  checkKeyboardAccess(definition) {
    return this.checks.checkKeyboardAccess(definition);
  }

  checkNoKeyboardTrap(definition) {
    return this.checks.checkNoKeyboardTrap(definition);
  }

  checkFocusOrder(definition) {
    return this.checks.checkFocusOrder(definition);
  }

  checkFocusIndicator(definition) {
    return this.checks.checkFocusIndicator(definition);
  }

  checkLanguage(definition) {
    return this.checks.checkLanguage(definition);
  }

  checkConsistency(definition) {
    return this.checks.checkConsistency(definition);
  }

  checkLabels(definition) {
    return this.checks.checkLabels(definition);
  }

  checkNameRoleValue(definition) {
    return this.checks.checkNameRoleValue(definition);
  }

  checkStatusMessages(definition) {
    return this.checks.checkStatusMessages(definition);
  }

  getRelativeLuminance(hexColor) {
    return this.utils.getRelativeLuminance(hexColor);
  }

  getComplianceScore(results) {
    return this.utils.getComplianceScore(results);
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
