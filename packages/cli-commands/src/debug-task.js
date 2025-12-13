import path from 'path';
import { existsSync } from 'fs';
import fse from 'fs-extra';
import logger from '@sequentialos/sequential-logging';

export async function debugTask(options) {
  const { taskName, input = {}, breakpoints = [], verbose = false } = options;

  const tasksDir = path.resolve(process.cwd(), 'tasks');
  const taskFile = path.join(tasksDir, `${taskName}.js`);

  if (!existsSync(taskFile)) {
    throw new Error(`Task '${taskName}' not found at ${taskFile}`);
  }

  if (verbose) {
    logger.info(`Debugging task: ${taskName}`);
    logger.info('Input:', input);
    if (breakpoints.length > 0) {
      logger.info('Breakpoints:', breakpoints.join(', '));
    }
  }

  try {
    const taskModule = await import(taskFile);
    const funcName = taskName.replace(/-/g, '_');
    const taskFunction = taskModule[funcName] || taskModule[taskName] || taskModule.default;

    if (typeof taskFunction !== 'function') {
      throw new Error(`No function '${funcName}' or default export found in ${taskFile}`);
    }

    logger.info('✓ Task loaded successfully');

    const debugEnv = process.env.DEBUG;
    process.env.DEBUG = '1';

    const startTime = Date.now();
    const result = await taskFunction(input);
    const duration = Date.now() - startTime;

    process.env.DEBUG = debugEnv;

    logger.info(`✓ Task completed in ${duration}ms`);

    if (result && result._debug) {
      logger.info('\n=== Debug Report ===');
      const report = result._debug;

      if (report.checkpoints && report.checkpoints.length > 0) {
        logger.info('Breakpoints:');
        report.checkpoints.forEach(cp => {
          logger.info(`  [${cp.elapsed}ms] ${cp.name}`);
        });
      }

      if (report.measurements && report.measurements.length > 0) {
        logger.info('Measurements:');
        report.measurements.forEach(m => {
          const status = m.success ? '✓' : '✗';
          logger.info(`  ${status} ${m.name}: ${m.duration}ms`);
        });
      }
    }

    if (verbose) {
      logger.info('\nFinal Result:');
      logger.info(JSON.stringify(result, null, 2));
    }

    return {
      valid: true,
      executed: true,
      duration,
      result
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    logger.error('✗ Debug execution failed:', error);
    if (verbose && e instanceof Error && e.stack) {
      logger.error('Stack trace:', e.stack);
    }
    return {
      valid: false,
      executed: false,
      error
    };
  }
}
