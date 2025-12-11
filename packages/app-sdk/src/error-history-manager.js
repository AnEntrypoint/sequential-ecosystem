/**
 * error-history-manager.js
 *
 * Manage error history with bounded storage
 */

export function createErrorHistoryManager(maxHistory = 100) {
  const errorHistory = [];

  return {
    recordError(diagnostic) {
      errorHistory.push(diagnostic);
      if (errorHistory.length > maxHistory) {
        errorHistory.shift();
      }
      return this;
    },

    getErrorHistory(toolName = null) {
      if (!toolName) return errorHistory;
      return errorHistory.filter(e => e.tool === toolName);
    },

    clearErrorHistory() {
      errorHistory.length = 0;
      return this;
    }
  };
}
