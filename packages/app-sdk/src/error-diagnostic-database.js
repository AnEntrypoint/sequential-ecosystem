/**
 * error-diagnostic-database.js
 *
 * Database of error causes and debug steps by category
 */

export function createErrorDiagnosticDatabase() {
  const causesDatabase = {
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

  const stepsDatabase = {
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

  return {
    getPossibleCauses(category) {
      return causesDatabase[category] || ['Unknown cause - check error message'];
    },

    getDebugSteps(category) {
      return stepsDatabase[category] || ['Check error message and logs for details'];
    }
  };
}
