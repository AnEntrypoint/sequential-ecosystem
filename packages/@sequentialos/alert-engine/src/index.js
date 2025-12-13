/**
 * index.js - Facade for alert engine
 *
 * Delegates to focused modules:
 * - alert-rule: Rule definition and evaluation
 * - alert-conditions: Pre-built condition factories
 * - alert-storage: Rule and alert storage management
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import { AlertRule, createAlertRule } from './alert-rule.js';
import { AlertConditions } from './alert-conditions.js';
import { createAlertStorage } from './alert-storage.js';

export class AlertEngine extends EventEmitter {
  constructor() {
    super();
    this.storage = createAlertStorage();
  }

  createRule(name, condition, actions = [], metadata = {}) {
    const rule = createAlertRule(name, condition, actions, metadata);
    this.storage.addRule(rule);
    this.emit('rule:created', { id: rule.id, name });
    return rule;
  }

  evaluateRule(ruleId, value) {
    const rule = this.storage.getRule(ruleId);
    if (!rule || !rule.enabled) return null;

    const triggered = rule.evaluate(value);

    if (triggered) {
      const alert = {
        id: randomUUID(),
        ruleId,
        ruleName: rule.name,
        value,
        timestamp: Date.now(),
        status: 'active',
        actions: rule.actions,
        metadata: rule.metadata
      };

      rule.recordTrigger();
      this.storage.addAlert(alert);

      this.emit('alert:triggered', alert);

      rule.actions.forEach(action => {
        try {
          action(alert);
        } catch (e) {
          this.emit('action:error', { alertId: alert.id, action: action.name, error: e.message });
        }
      });

      return alert;
    }

    return null;
  }

  evaluateAllRules(metrics) {
    const triggered = [];
    for (const rule of this.storage.getAllRules()) {
      if (rule.enabled && metrics) {
        const alert = this.evaluateRule(rule.id, metrics);
        if (alert) triggered.push(alert);
      }
    }
    return triggered;
  }

  resolveAlert(alertId, resolution = 'acknowledged') {
    const alert = this.storage.resolveAlert(alertId);
    if (alert) {
      alert.status = resolution;
      alert.resolvedAt = Date.now();
      this.emit('alert:resolved', { id: alertId, resolution });
    }
  }

  getRule(ruleId) {
    return this.storage.getRule(ruleId);
  }

  getAllRules() {
    return this.storage.getAllRules().map(rule => ({
      id: rule.id,
      name: rule.name,
      enabled: rule.enabled,
      lastTriggered: rule.lastTriggered,
      triggerCount: rule.triggerCount
    }));
  }

  getActiveAlerts() {
    return this.storage.getActiveAlerts();
  }

  getAlertHistory(limit = 100) {
    return this.storage.getAlertHistory(limit);
  }

  enableRule(ruleId) {
    const rule = this.storage.getRule(ruleId);
    if (rule) rule.enabled = true;
  }

  disableRule(ruleId) {
    const rule = this.storage.getRule(ruleId);
    if (rule) rule.enabled = false;
  }

  deleteRule(ruleId) {
    this.storage.deleteRule(ruleId);
    this.emit('rule:deleted', { id: ruleId });
  }

  clear() {
    this.storage.clear();
  }
}

export { AlertRule, AlertConditions };
export const createAlertEngine = () => new AlertEngine();
