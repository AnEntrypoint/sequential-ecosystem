// AI suggestion rules and analysis
import { AIRuleDefinitions } from './ai-rule-definitions.js';

export class AISuggestionRules {
  constructor() {
    this.rules = AIRuleDefinitions.getAllRules();
  }

  getPerformanceRules() {
    return this.rules.performance;
  }

  getAccessibilityRules() {
    return this.rules.accessibility;
  }

  getDesignRules() {
    return this.rules.design;
  }

  getAllRules() {
    return this.rules;
  }

  getRulesByCategory(category) {
    return this.rules[category] || [];
  }
}
