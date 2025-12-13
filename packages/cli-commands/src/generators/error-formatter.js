/**
 * Error Formatter
 * Formats errors with context and parses stack traces
 */

import { getStackTrace } from '@sequentialos/error-handling';

export function formatErrorWithContext(error, context = {}) {
  if (!(error instanceof Error)) {
    return {
      message: String(error),
      type: typeof error,
      context
    };
  }

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
  const lines = getStackTrace({ stack: stackStr });
  return lines
    .map(line => {
      const match = line.match(/at\s+(?:async\s+)?(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (!match) {
        return { raw: line };
      }

      const [, fn, file, lineNum, colNum] = match;
      return {
        function: fn,
        file: file.replace(process.cwd(), '.'),
        line: parseInt(lineNum),
        column: parseInt(colNum),
        raw: line
      };
    });
}
