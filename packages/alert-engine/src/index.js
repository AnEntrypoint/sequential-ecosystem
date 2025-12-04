const { EventEmitter } = require('events');
const { randomUUID } = require('crypto');

class AlertRule {
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
}

class AlertEngine extends EventEmitter {
  constructor() {
    super();
    this.rules = new Map();
    this.activeAlerts = new Map();
    this.alertHistory = [];
  }

  createRule(name, condition, actions = [], metadata = {}) {
    const id = randomUUID();
    const rule = new AlertRule(id, name, condition, actions, metadata);
    this.rules.set(id, rule);
    this.emit('rule:created', { id, name });
    return rule;
  }

  evaluateRule(ruleId, value) {
    const rule = this.rules.get(ruleId);
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

      rule.lastTriggered = Date.now();
      rule.triggerCount++;

      this.activeAlerts.set(alert.id, alert);
      this.alertHistory.push(alert);

      if (this.alertHistory.length > 10000) this.alertHistory.shift();

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
    for (const rule of this.rules.values()) {
      if (rule.enabled && metrics) {
        const alert = this.evaluateRule(rule.id, metrics);
        if (alert) triggered.push(alert);
      }
    }
    return triggered;
  }

  resolveAlert(alertId, resolution = 'acknowledged') {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.status = resolution;
      alert.resolvedAt = Date.now();
      this.activeAlerts.delete(alertId);
      this.emit('alert:resolved', { id: alertId, resolution });
    }
  }

  getRule(ruleId) {
    return this.rules.get(ruleId);
  }

  getAllRules() {
    return Array.from(this.rules.values()).map(rule => ({
      id: rule.id,
      name: rule.name,
      enabled: rule.enabled,
      lastTriggered: rule.lastTriggered,
      triggerCount: rule.triggerCount
    }));
  }

  getActiveAlerts() {
    return Array.from(this.activeAlerts.values());
  }

  getAlertHistory(limit = 100) {
    return this.alertHistory.slice(-limit);
  }

  enableRule(ruleId) {
    const rule = this.rules.get(ruleId);
    if (rule) rule.enabled = true;
  }

  disableRule(ruleId) {
    const rule = this.rules.get(ruleId);
    if (rule) rule.enabled = false;
  }

  deleteRule(ruleId) {
    this.rules.delete(ruleId);
    this.emit('rule:deleted', { id: ruleId });
  }

  clear() {
    this.rules.clear();
    this.activeAlerts.clear();
    this.alertHistory = [];
  }
}

class AlertConditions {
  static threshold(key, operator, value) {
    return (metrics) => {
      const metricValue = metrics[key];
      if (metricValue === undefined) return false;
      switch (operator) {
        case '>':
          return metricValue > value;
        case '<':
          return metricValue < value;
        case '>=':
          return metricValue >= value;
        case '<=':
          return metricValue <= value;
        case '==':
          return metricValue === value;
        default:
          return false;
      }
    };
  }

  static errorRate(threshold) {
    return (metrics) => metrics.errorRate !== undefined && metrics.errorRate > threshold;
  }

  static slowEndpoint(durationThreshold) {
    return (metrics) => metrics.avgDuration !== undefined && metrics.avgDuration > durationThreshold;
  }

  static memoryUsage(percentThreshold) {
    return (metrics) => metrics.memoryUsagePercent !== undefined && metrics.memoryUsagePercent > percentThreshold;
  }

  static and(...conditions) {
    return (metrics) => conditions.every(c => c(metrics));
  }

  static or(...conditions) {
    return (metrics) => conditions.some(c => c(metrics));
  }
}

module.exports = {
  AlertEngine,
  AlertRule,
  AlertConditions,
  createAlertEngine: () => new AlertEngine()
};
