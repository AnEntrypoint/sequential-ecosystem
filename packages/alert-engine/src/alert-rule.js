/**
 * alert-rule.js
 *
 * Alert rule definition and evaluation
 */

import { randomUUID } from 'crypto';

export class AlertRule {
  constructor(id, name, condition, actions = [], metadata = {}) {
    this.id = id;
    this.name = name;
    this.condition = condition;
    this.actions = actions;
    this.metadata = metadata;
    this.enabled = true;
    this.lastTriggered = null;
    this.triggerCount = 0;
  }

  evaluate(value) {
    try {
      return this.condition(value);
    } catch (e) {
      return false;
    }
  }

  recordTrigger() {
    this.lastTriggered = Date.now();
    this.triggerCount++;
  }
}

export function createAlertRule(name, condition, actions = [], metadata = {}) {
  return new AlertRule(randomUUID(), name, condition, actions, metadata);
}
