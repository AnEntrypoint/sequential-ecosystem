// Pattern validator facade - maintains 100% backward compatibility
import { ValidatorRules } from './validator-rules.js';
import { ValidatorEngine } from './validator-engine.js';
import { ValidatorFixes } from './validator-fixes.js';
import { ValidatorUI } from './validator-ui.js';

class PatternValidator {
  constructor() {
    this.rules = new ValidatorRules();
    this.engine = new ValidatorEngine(this.rules);
    this.fixes = new ValidatorFixes();
    this.ui = new ValidatorUI(this.engine);

    // Expose for backward compatibility
    this.validationResults = this.engine.validationResults;
  }

  initializeRules() {
    return this.rules.initializeRules();
  }

  addRule(ruleName, validator) {
    return this.rules.addRule(ruleName, validator);
  }

  addCustomValidator(name, fn) {
    return this.rules.addCustomValidator(name, fn);
  }

  validate(component, ruleNames = null) {
    return this.engine.validate(component, ruleNames);
  }

  validateDeep(component, depth = 0) {
    return this.engine.validateDeep(component, depth);
  }

  getValidationReport(component, results) {
    return this.engine.getValidationReport(component, results);
  }

  findAllIssues(component) {
    return this.engine.findAllIssues(component);
  }

  suggestFixes(component) {
    return this.fixes.suggestFixes(component, this.validationResults);
  }

  buildValidationUI() {
    return this.ui.buildValidationUI();
  }

  buildStatusCard(label, count, color) {
    return this.ui.buildStatusCard(label, count, color);
  }

  exportValidationReport() {
    return this.fixes.exportValidationReport(this.validationResults);
  }
}

function createPatternValidator() {
  return new PatternValidator();
}

export { PatternValidator, createPatternValidator };
