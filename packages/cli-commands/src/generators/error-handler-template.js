/**
 * Error Handler Template
 * Generates error handler code templates
 */

export function generateErrorHandler(taskOrFlowName, isAsync = false) {
  return `
/**
 * Error handling for ${taskOrFlowName}
 * Provides contextual information for debugging
 */

function createErrorHandler(context = {}) {
  return {
    wrap: (fn, fnName) => {
      return function(...args) {
        try {
          return fn.apply(this, args);
        } catch (e) {
          const error = new Error(\`\${fnName}: \${e.message}\`);
          error.context = context;
          error.cause = e;
          throw error;
        }
      };
    },

    wrapAsync: (fn, fnName) => {
      return async function(...args) {
        try {
          return await fn.apply(this, args);
        } catch (e) {
          const error = new Error(\`\${fnName}: \${e.message}\`);
          error.context = { ...context, async: true };
          error.cause = e;
          throw error;
        }
      };
    },

    handle: (error) => {
      console.error('Error in ${taskOrFlowName}:');
      console.error('  Message:', error.message);
      if (error.context) {
        console.error('  Context:', error.context);
      }
      if (error.cause) {
        console.error('  Caused by:', error.cause.message);
      }
      throw error;
    }
  };
}

const errorHandler = createErrorHandler({ task: '${taskOrFlowName}' });

// Usage:
// const safeOperation = errorHandler.${isAsync ? 'wrapAsync' : 'wrap'}(
//   async (input) => { /* ... */ },
//   'operationName'
// );
`;
}
