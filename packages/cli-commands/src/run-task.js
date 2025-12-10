import path from 'path';
import { createCLICommand } from '@sequentialos/cli-handler';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import fse from 'fs-extra';
import { createAdapter } from '@sequentialos/sequential-adaptor';
import logger from '@sequentialos/sequential-logging';
import { nowISO, createTimestamps, updateTimestamp } from '@sequentialos/timestamp-utilities';

export async function runTask(options) {
  const { taskName, input = {}, save = false, dryRun = false, verbose = false } = options;

  const tasksDir = path.resolve(process.cwd(), 'tasks');
  const taskFile = path.join(tasksDir, `${taskName}.js`);

  if (!existsSync(taskFile)) {
    throw new Error(`Task '${taskName}' not found at ${taskFile}`);
  }

  if (verbose) {
    logger.info(`Running task: ${taskName}`);
    logger.info(`Input:`, input);
  }

  const code = await fse.readFile(taskFile, 'utf-8');

  if (dryRun) {
    if (verbose) {
      logger.info('Dry run mode - execute without saving');
    }
    try {
      const taskModule = await import(taskFile);
      const funcName = taskName.replace(/-/g, '_');
      const taskFunction = taskModule[funcName] || taskModule[taskName] || taskModule.default;

      if (typeof taskFunction !== 'function') {
        throw new Error(`No function '${funcName}' or default export found in ${taskFile}`);
      }

      if (verbose) {
        logger.info('✓ Task syntax is valid');
        logger.info('Executing task...');
      }

      const result = await taskFunction(input);

      if (verbose) {
        logger.info('✓ Task executed successfully');
        logger.info('Result:', JSON.stringify(result, null, 2));
      }

      return {
        dryRun: true,
        valid: true,
        executed: true,
        result
      };
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      logger.error('✗ Dry run failed:', error);
      if (verbose && e instanceof Error && e.stack) {
        logger.error('Stack trace:', e.stack);
      }
      return {
        dryRun: true,
        valid: false,
        executed: false,
        error
      };
    }
  }

  const runId = randomUUID();
  const runStartTime = nowISO();

  try {
    // Check task runner type from config
    const taskModule = await import(taskFile);
    const config = taskModule.config || {};
    const runner = config.runner || 'sequential-flow';

    if (runner === 'sequential-machine') {
      // Use Sequential Machine runner
      if (verbose) {
        logger.info(`Using Sequential Machine runner`);
      }

      const funcName = taskName.replace(/-/g, '_');
      const taskFunction = taskModule[funcName] || taskModule[taskName] || taskModule.default;

      if (typeof taskFunction !== 'function') {
        throw new Error(`No default export or '${funcName}' export found in ${taskFile}`);
      }

      // Execute task function directly - it will handle its own filesystem operations
      const result = await taskFunction(input);

      const runData = {
        id: runId,
        taskName,
        runner: 'sequential-machine',
        status: 'success',
        input,
        output: result,
        startedAt: runStartTime,
        completedAt: nowISO()
      };

      if (verbose) {
        logger.info('Result:', result);
      }

      return runData;
    } else {
      // Use Sequential Flow runner (default)
      const adapter = await createAdapter('folder', { basePath: tasksDir });

      try {
        const funcName = taskName.replace(/-/g, '_');
        const taskFunction = taskModule[funcName] || taskModule[taskName] || taskModule.default;

        if (typeof taskFunction !== 'function') {
          throw new Error(`No default export or '${funcName}' export found in ${taskFile}`);
        }

        const taskRun = await adapter.createTaskRun({
          id: runId,
          taskName,
          status: 'running',
          input,
          startedAt: runStartTime
        });

        const result = await taskFunction(input);

        const runData = {
          id: runId,
          taskName,
          runner: 'sequential-flow',
          status: 'success',
          input,
          output: result,
          startedAt: runStartTime,
          completedAt: nowISO()
        };

        if (save) {
          await adapter.updateTaskRun(runId, {
            status: 'success',
            output: result,
            completedAt: nowISO()
          });
        }

        if (verbose) {
          logger.info('Result:', result);
        }

        return runData;
      } finally {
        await adapter.close();
      }
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);

    const runData = {
      id: runId,
      taskName,
      status: 'error',
      input,
      error,
      startedAt: runStartTime,
      completedAt: nowISO()
    };

    if (verbose) {
      logger.error('Error:', error);
    }

    return runData;
  }
}
