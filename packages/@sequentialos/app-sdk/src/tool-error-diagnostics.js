import { createErrorClassifier } from './error-classifier.js';
import { createErrorDiagnosticDatabase } from './error-diagnostic-database.js';
import { createErrorHistoryManager } from './error-history-manager.js';
import { createErrorInputSanitizer } from './error-input-sanitizer.js';

/**
 * tool-error-diagnostics.js - Facade for tool error diagnostics
 *
 * Delegates to focused modules:
 * - error-classifier: Error classification with suggestions
 * - error-diagnostic-database: Causes and debug steps database
 * - error-history-manager: Error recording and retrieval
 * - error-input-sanitizer: Sensitive data sanitization
 */

export function createToolErrorDiagnostics() {
  const classifier = createErrorClassifier();
  const database = createErrorDiagnosticDatabase();
  const historyManager = createErrorHistoryManager(100);
  const sanitizer = createErrorInputSanitizer();

  return {
    classifyError(error, toolName, context = {}) {
      return classifier.classifyError(error, toolName, context);
    },

    diagnoseToolFailure(error, toolName, input = {}, context = {}) {
      const classification = this.classifyError(error, toolName, context);

      return {
        tool: toolName,
        timestamp: new Date().toISOString(),
        error: {
          message: error.message,
          category: classification.category,
          severity: classification.severity
        },
        diagnostics: {
          classification,
          suggestion: classification.suggestion,
          possibleCauses: database.getPossibleCauses(classification.category),
          debugSteps: database.getDebugSteps(classification.category)
        },
        context: {
          inputSample: sanitizer.sanitizeInput(input),
          toolContext: context
        },
        fullStack: error.stack
      };
    },

    getPossibleCauses(category) {
      return database.getPossibleCauses(category);
    },

    getDebugSteps(category) {
      return database.getDebugSteps(category);
    },

    sanitizeInput(input) {
      return sanitizer.sanitizeInput(input);
    },

    recordError(diagnostic) {
      return historyManager.recordError(diagnostic);
    },

    getErrorHistory(toolName = null) {
      return historyManager.getErrorHistory(toolName);
    },

    clearErrorHistory() {
      return historyManager.clearErrorHistory();
    }
  };
}
