export function createToolErrorDiagnostics() {
  const errorHistory = [];
  const maxHistory = 100;

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
          possibleCauses: this.getPossibleCauses(classification.category),
          debugSteps: this.getDebugSteps(classification.category)
        },
        context: {
          inputSample: this.sanitizeInput(input),
          toolContext: context
        },
        fullStack: error.stack
      };
    },

    getPossibleCauses(category) {
      const causes = {
        syntax_error: [
          'Invalid JavaScript syntax in tool implementation',
          'Mismatched quotes or brackets',
          'Invalid JSDoc comments'
        ],
        undefined_reference: [
          'Variable used before declaration',
          'Missing import or dependency',
          'Typo in variable name'
        ],
        timeout: [
          'Long-running operation (loop, recursion)',
          'Waiting for unresponsive external service',
          'Deadlock or circular dependency'
        ],
        missing_dependency: [
          'npm package not in whitelist',
          'CDN dependency not loaded',
          'Missing import statement'
        ],
        cors_error: [
          'API does not allow cross-origin requests',
          'Missing CORS headers on API',
          'Wrong domain/origin'
        ],
        authentication: [
          'Invalid or expired API key',
          'Missing authentication headers',
          'Insufficient permissions'
        ],
        resource_not_found: [
          'Incorrect API endpoint URL',
          'Resource deleted or moved',
          'Query parameters missing or wrong'
        ],
        server_error: [
          'API server is down or overloaded',
          'Database connection failed',
          'API bug or misconfiguration'
        ]
      };

      return causes[category] || ['Unknown cause - check error message'];
    },

    getDebugSteps(category) {
      const steps = {
        syntax_error: [
          '1. Copy tool implementation to JavaScript validator (jshint.com)',
          '2. Check for matching quotes and brackets',
          '3. Review JSDoc comments for invalid syntax'
        ],
        undefined_reference: [
          '1. Search implementation for all variables used',
          '2. Verify each variable is declared before use',
          '3. Check imports option for missing dependencies'
        ],
        timeout: [
          '1. Add console.log statements to track execution progress',
          '2. Check for infinite loops or recursive calls',
          '3. Increase timeout limit if operation legitimately slow'
        ],
        missing_dependency: [
          '1. Identify which npm package is needed',
          '2. Check whitelist in tool registration (tools.js)',
          '3. Add to imports: { npm: ["package-name"] }'
        ],
        cors_error: [
          '1. Verify API endpoint URL is correct',
          '2. Check API documentation for CORS headers',
          '3. Use server-side proxy if API does not allow CORS'
        ],
        authentication: [
          '1. Verify API key/token is valid and not expired',
          '2. Check token is passed in correct header (Authorization, API-Key, etc)',
          '3. Verify user/app has required permissions'
        ],
        resource_not_found: [
          '1. Test API endpoint with curl or Postman',
          '2. Verify query parameters are correct',
          '3. Confirm resource exists (not deleted)'
        ],
        server_error: [
          '1. Check API status page for outages',
          '2. Retry with exponential backoff',
          '3. Contact API support with error details'
        ]
      };

      return steps[category] || ['Check error message and logs for details'];
    },

    sanitizeInput(input) {
      if (!input || typeof input !== 'object') return input;

      const sanitized = { ...input };
      const sensitive = ['password', 'token', 'key', 'secret', 'apiKey', 'authorization'];

      for (const key of Object.keys(sanitized)) {
        if (sensitive.some(s => key.toLowerCase().includes(s))) {
          sanitized[key] = '***REDACTED***';
        }
      }

      return sanitized;
    },

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
