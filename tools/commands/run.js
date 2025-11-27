import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { createAdapter } from 'sequential-adaptor';

export const command = {
  name: 'run <taskName>',
  description: 'Execute a task',
  options: [
    ['--input <json>', 'Input parameters as JSON'],
    ['--save', 'Save execution result'],
    ['--dry-run', 'Check syntax without executing'],
    ['-v, --verbose', 'Verbose output'],
    ['--runner <type>', 'Runner type (fetch, flow, container)']
  ],
  action: async (taskName, options) => {
    const input = options.input ? JSON.parse(options.input) : {};
    const tasksDir = path.join(process.cwd(), 'tasks');
    const taskFile = path.join(tasksDir, `${taskName}.js`);

    if (!fs.existsSync(taskFile)) {
      throw new Error(`Task '${taskName}' not found at ${taskFile}`);
    }

    if (options.verbose) {
      console.log(`Running task: ${taskName}`);
      console.log(`Input:`, input);
    }

    const code = fs.readFileSync(taskFile, 'utf-8');

    if (options.dryRun) {
      if (options.verbose) console.log('Dry run mode - syntax check only');
      const funcName = taskName.replace(/-/g, '_');
      if (!code.includes(`function ${funcName}`) && !code.includes('export default')) {
        throw new Error(`No function '${funcName}' or default export found`);
      }
      console.log('Task syntax is valid');
      return { dryRun: true, valid: true };
    }

    const runId = randomUUID();
    const runStartTime = new Date().toISOString();
    const adapter = await createAdapter('folder', { basePath: tasksDir });

    try {
      const taskModule = await import(taskFile);
      const funcName = taskName.replace(/-/g, '_');
      const taskFunction = taskModule[funcName] || taskModule[taskName] || taskModule.default;

      if (typeof taskFunction !== 'function') {
        throw new Error(`No default export or '${funcName}' export found in ${taskFile}`);
      }

      await adapter.createTaskRun({
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
        status: 'success',
        input,
        output: result,
        startedAt: runStartTime,
        completedAt: new Date().toISOString()
      };

      if (options.save) {
        await adapter.updateTaskRun(runId, {
          status: 'success',
          output: result,
          completedAt: new Date().toISOString()
        });
      }

      if (options.verbose) console.log('Result:', result);
      if (!options.dryRun) console.log(JSON.stringify(runData, null, 2));

      return runData;
    } finally {
      await adapter.close();
    }
  }
};
