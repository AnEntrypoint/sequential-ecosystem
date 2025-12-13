export function generateTaskDebuggerTemplate(taskName, description = '') {
  return `/**
 * ${taskName} - Task with Debug Support
 * ${description || 'Task with built-in debugging capabilities'}
 *
 * Debug Usage:
 *   const debug = createDebugger('${taskName}');
 *   debug.log('variable', variable);        // Log values
 *   debug.breakpoint('checkpoint-name');     // Create breakpoint
 *   debug.measure('operation', async () => { ... }); // Time operations
 */

function createDebugger(taskName) {
  const DEBUG = process.env.DEBUG === '1' || process.env.DEBUG === 'true';
  const startTime = Date.now();
  const checkpoints = [];
  const measurements = [];

  return {
    log(label, value) {
      if (DEBUG) {
        const elapsed = Date.now() - startTime;
        console.log(\`[\${elapsed}ms] \${label}:\`,
          typeof value === 'object' ? JSON.stringify(value, null, 2) : value);
      }
      return value;
    },

    breakpoint(name) {
      const elapsed = Date.now() - startTime;
      checkpoints.push({ name, elapsed });
      if (DEBUG) {
        console.log(\`[BREAKPOINT] \${name} at \${elapsed}ms\`);
      }
    },

    async measure(name, fn) {
      const start = Date.now();
      try {
        const result = await fn();
        const duration = Date.now() - start;
        measurements.push({ name, duration, success: true });
        if (DEBUG) {
          console.log(\`[MEASURE] \${name}: \${duration}ms\`);
        }
        return result;
      } catch (e) {
        const duration = Date.now() - start;
        measurements.push({ name, duration, success: false, error: e.message });
        if (DEBUG) {
          console.log(\`[MEASURE] \${name}: \${duration}ms (ERROR: \${e.message})\`);
        }
        throw e;
      }
    },

    report() {
      if (checkpoints.length > 0 || measurements.length > 0) {
        return {
          taskName: '${taskName}',
          totalTime: Date.now() - startTime,
          checkpoints,
          measurements
        };
      }
      return null;
    }
  };
}

export async function ${taskName.replace(/-/g, '_')}(input) {
  const debug = createDebugger('${taskName}');

  try {
    debug.breakpoint('start');
    debug.log('input', input);

    // TODO: Implement task logic here
    debug.breakpoint('processing');

    const result = {
      success: true,
      message: 'Task completed',
      input
    };

    debug.breakpoint('end');
    debug.log('result', result);

    // Return debug report if available
    const report = debug.report();
    if (report) {
      return { ...result, _debug: report };
    }

    return result;
  } catch (error) {
    debug.log('error', error.message);
    throw error;
  }
}
`;
}
