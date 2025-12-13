/**
 * error-classifier.js
 *
 * Classify errors into categories with suggestions
 */

export function createErrorClassifier() {
  return {
    classifyError(error, toolName, context = {}) {
      const message = error.message || String(error);
      const stack = error.stack || '';

      let category = 'unknown';
      let severity = 'error';
      let suggestion = 'Check tool implementation for issues';

      if (message.includes('SyntaxError') || message.includes('Unexpected token')) {
        category = 'syntax_error';
        suggestion = 'Tool implementation has syntax error. Check JSDoc comments and code for invalid syntax.';
      } else if (message.includes('is not defined') || message.includes('Cannot read')) {
        category = 'undefined_reference';
        suggestion = 'Tool references undefined variable. Ensure all dependencies are imported via imports option.';
      } else if (message.includes('timeout') || message.includes('timed out')) {
        category = 'timeout';
        severity = 'warning';
        suggestion = 'Tool execution exceeded time limit. Check for long-running operations or deadlocks.';
      } else if (message.includes('dependency') || message.includes('module not found')) {
        category = 'missing_dependency';
        suggestion = 'Tool requires npm package or external dependency. Add to imports: { npm: [...] } in tool options.';
      } else if (message.includes('CORS') || message.includes('cross-origin')) {
        category = 'cors_error';
        suggestion = 'Tool attempted cross-origin request. Ensure API endpoint is accessible from client domain.';
      } else if (message.includes('401') || message.includes('unauthorized')) {
        category = 'authentication';
        suggestion = 'Tool request failed authentication. Verify API key, token, or credentials.';
      } else if (message.includes('404') || message.includes('not found')) {
        category = 'resource_not_found';
        suggestion = 'API endpoint or resource not found. Verify URL and resource exists.';
      } else if (message.includes('500') || message.includes('server error')) {
        category = 'server_error';
        suggestion = 'Remote server error. Tool cannot control this - retry later or contact API support.';
      }

      return {
        category,
        severity,
        message,
        suggestion,
        stack
      };
    }
  };
}
