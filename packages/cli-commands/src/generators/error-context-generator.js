export function formatErrorWithContext(error, context = {}) {
  if (!(error instanceof Error)) {
    return {
      message: String(error),
      type: typeof error,
      context
    };
  }

  const lines = error.stack?.split('\n') || [];
  const stackLines = lines.slice(1).filter(l => l.trim());

  return {
    message: error.message,
    type: error.constructor.name,
    cause: error.cause ? formatErrorWithContext(error.cause) : null,
    context: {
      ...context,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version
    },
    stack: {
      raw: error.stack,
      parsed: parseStackTrace(error.stack || '')
    }
  };
}

export function parseStackTrace(stackStr) {
  const lines = stackStr.split('\n').slice(1);
  return lines
    .filter(l => l.trim())
    .map(line => {
      const match = line.match(/at\s+(?:async\s+)?(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (!match) {
        return { raw: line.trim() };
      }

      const [, fn, file, lineNum, colNum] = match;
      return {
        function: fn,
        file: file.replace(process.cwd(), '.'),
        line: parseInt(lineNum),
        column: parseInt(colNum),
        raw: line.trim()
      };
    });
}

export function createErrorHandler(context = {}) {
  return {
    wrap: (fn, fnName = fn.name || 'anonymous') => {
      return function(...args) {
        try {
          return fn.apply(this, args);
        } catch (e) {
          throw formatErrorWithContext(e, {
            ...context,
            function: fnName,
            args: args.length
          });
        }
      };
    },

    wrapAsync: (fn, fnName = fn.name || 'anonymous') => {
      return async function(...args) {
        try {
          return await fn.apply(this, args);
        } catch (e) {
          throw formatErrorWithContext(e, {
            ...context,
            function: fnName,
            async: true,
            args: args.length
          });
        }
      };
    },

    handle: (error) => {
      const formatted = formatErrorWithContext(error, context);
      console.error('\n=== Error Details ===');
      console.error(`Message: ${formatted.message}`);
      console.error(`Type: ${formatted.type}`);

      if (formatted.stack.parsed.length > 0) {
        console.error('\nStack Trace:');
        formatted.stack.parsed.forEach((frame, idx) => {
          if (frame.function) {
            console.error(`  ${idx + 1}. ${frame.function}`);
            console.error(`     at ${frame.file}:${frame.line}:${frame.column}`);
          } else {
            console.error(`  ${idx + 1}. ${frame.raw}`);
          }
        });
      }

      if (Object.keys(context).length > 0) {
        console.error('\nContext:');
        Object.entries(context).forEach(([key, val]) => {
          console.error(`  ${key}: ${val}`);
        });
      }

      if (formatted.cause) {
        console.error('\nCaused By:');
        console.error(`  ${formatted.cause.message}`);
      }

      return formatted;
    }
  };
}

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
