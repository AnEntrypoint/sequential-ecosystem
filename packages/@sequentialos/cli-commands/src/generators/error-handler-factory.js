/**
 * Error Handler Factory
 * Creates error handlers with wrapping and logging
 */

import { formatErrorWithContext } from './error-formatter.js';

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
