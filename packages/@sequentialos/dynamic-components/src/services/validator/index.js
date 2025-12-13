import { ValidatorCore } from './validator-core.js';
import { ValidatorUI } from './validator-ui.js';

export class AccessibilityValidatorUI {
  constructor(patternAISuggestions) {
    this.aiSuggestions = patternAISuggestions;
    this.core = new ValidatorCore();
    this.ui = new ValidatorUI(this.core);
  }

  initializeWCAGRules() {
    return this.core.initializeWCAGRules();
  }

  auditPattern(definition, level = 'AA') {
    return this.core.auditPattern(definition, level);
  }

  isLevelApplicable(ruleLevel, selectedLevel) {
    return this.core.isLevelApplicable(ruleLevel, selectedLevel);
  }

  calculateSeverity(level) {
    return this.core.calculateSeverity(level);
  }

  checkAltText(definition) {
    return this.core.checkAltText(definition);
  }

  checkContrast(definition) {
    return this.core.checkContrast(definition);
  }

  checkUIContrast(definition) {
    return this.core.checkUIContrast(definition);
  }

  checkKeyboardAccess(definition) {
    return this.core.checkKeyboardAccess(definition);
  }

  checkNoKeyboardTrap(definition) {
    return this.core.checkNoKeyboardTrap(definition);
  }

  checkFocusOrder(definition) {
    return this.core.checkFocusOrder(definition);
  }

  checkFocusIndicator(definition) {
    return this.core.checkFocusIndicator(definition);
  }

  checkLanguage(definition) {
    return this.core.checkLanguage(definition);
  }

  checkConsistency(definition) {
    return this.core.checkConsistency(definition);
  }

  checkLabels(definition) {
    return this.core.checkLabels(definition);
  }

  checkNameRoleValue(definition) {
    return this.core.checkNameRoleValue(definition);
  }

  checkStatusMessages(definition) {
    return this.core.checkStatusMessages(definition);
  }

  getRelativeLuminance(hexColor) {
    return this.core.getRelativeLuminance(hexColor);
  }

  getComplianceScore(results) {
    return this.core.getComplianceScore(results);
  }

  buildValidatorUI(results = null) {
    return this.ui.buildValidatorUI(results);
  }

  buildComplianceHeader(results) {
    return this.ui.buildComplianceHeader(results);
  }

  buildLevelSelector() {
    return this.ui.buildLevelSelector();
  }

  buildResultsSummary(results) {
    return this.ui.buildResultsSummary(results);
  }

  buildCategoryResults(results) {
    return this.ui.buildCategoryResults(results);
  }

  capitalize(str) {
    return this.ui.capitalize(str);
  }

  on(event, callback) {
    return this.core.on(event, callback);
  }

  off(event, callback) {
    return this.core.off(event, callback);
  }

  notifyListeners(event, data) {
    return this.core.notifyListeners(event, data);
  }

  clear() {
    return this.core.clear();
  }

  get wcagRules() {
    return this.core.wcagRules;
  }

  get auditResults() {
    return this.core.auditResults;
  }

  get selectedLevel() {
    return this.core.selectedLevel;
  }

  set selectedLevel(value) {
    this.core.selectedLevel = value;
  }

  get listeners() {
    return this.core.listeners;
  }
}

export const createAccessibilityValidatorUI = (patternAISuggestions) => new AccessibilityValidatorUI(patternAISuggestions);
