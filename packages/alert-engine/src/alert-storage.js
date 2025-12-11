/**
 * alert-storage.js
 *
 * Alert and rule storage management
 */

export function createAlertStorage() {
  const rules = new Map();
  const activeAlerts = new Map();
  const alertHistory = [];
  const maxHistorySize = 10000;

  return {
    addRule(rule) {
      rules.set(rule.id, rule);
      return rule;
    },

    getRule(ruleId) {
      return rules.get(ruleId);
    },

    getAllRules() {
      return Array.from(rules.values());
    },

    deleteRule(ruleId) {
      rules.delete(ruleId);
    },

    addAlert(alert) {
      activeAlerts.set(alert.id, alert);
      alertHistory.push(alert);

      if (alertHistory.length > maxHistorySize) {
        alertHistory.shift();
      }

      return alert;
    },

    getAlert(alertId) {
      return activeAlerts.get(alertId);
    },

    resolveAlert(alertId) {
      const alert = activeAlerts.get(alertId);
      if (alert) {
        activeAlerts.delete(alertId);
      }
      return alert;
    },

    getActiveAlerts() {
      return Array.from(activeAlerts.values());
    },

    getAlertHistory(limit = 100) {
      return alertHistory.slice(-limit);
    },

    clear() {
      rules.clear();
      activeAlerts.clear();
      alertHistory.length = 0;
    }
  };
}
