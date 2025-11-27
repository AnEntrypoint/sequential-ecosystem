import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { createAdapter } from 'sequential-adaptor';

export async function runTask(options) {
  const { taskName, input = {}, save = false, dryRun = false, verbose = false } = options;

  const tasksDir = path.join(process.cwd(), 'tasks');
  const taskFile = path.join(tasksDir, `${taskName}.js`);

  if (!fs.existsSync(taskFile)) {
    throw new Error(`Task '${taskName}' not found at ${taskFile}`);
  }

  if (verbose) {
    console.log(`Running task: ${taskName}`);
    console.log(`Input:`, input);
  }

  const code = fs.readFileSync(taskFile, 'utf-8');

  if (dryRun) {
    if (verbose) {
      console.log('Dry run mode - syntax check only');
    }
    try {
      const funcName = taskName.replace(/-/g, '_');
      if (!code.includes(`function ${funcName}`) && !code.includes('export default')) {
        throw new Error(`No function '${funcName}' or default export found`);
      }
      console.log('✓ Task syntax is valid');
      return { dryRun: true, valid: true };
    } catch (e) {
      console.error('✗ Syntax error:', e instanceof Error ? e.message : String(e));
      return { dryRun: true, valid: false, error: String(e) };
    }
  }

  const runId = randomUUID();
  const runStartTime = new Date().toISOString();

  try {
    // Check task runner type from config
    const taskModule = await import(taskFile);
    const config = taskModule.config || {};
    const runner = config.runner || 'sequential-flow';

    if (runner === 'sequential-machine') {
      // Use Sequential Machine runner
      if (verbose) {
        console.log(`Using Sequential Machine runner`);
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
        completedAt: new Date().toISOString()
      };

      if (verbose) {
        console.log('Result:', result);
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
          completedAt: new Date().toISOString()
        };

        if (save) {
          await adapter.updateTaskRun(runId, {
            status: 'success',
            output: result,
            completedAt: new Date().toISOString()
          });
        }

        if (verbose) {
          console.log('Result:', result);
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
      completedAt: new Date().toISOString()
    };

    if (verbose) {
      console.error('Error:', error);
    }

    return runData;
  }
}
