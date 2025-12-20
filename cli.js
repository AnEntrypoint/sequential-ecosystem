#!/usr/bin/env node

import { program } from 'commander';
import {
  createTask,
  createTool,
  createApp,
  createFlow,
  syncTasks,
  runTask,
  getConfig,
  setConfig,
  showConfig,
  initCommand,
  guiCommand,
  listCommand,
  describeCommand,
  historyCommand,
  showCommand,
  deleteCommand
} from '@sequentialos/cli-commands';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8')
);

program
  .name('sequential-ecosystem')
  .description('Sequential task execution with flow and machine runners')
  .version(pkg.version || '1.0.0');

program
  .command('create-task <name>')
  .description('Create a new task')
  .option('--minimal', 'Minimal template with less boilerplate')
  .option('--with-graph', 'Create with explicit state graph (xstate FlowState)')
  .option('--runner <type>', 'Runner type: flow, machine, or os (for system commands)', 'flow')
  .option('--inputs <inputs>', 'Comma-separated input parameters')
  .option('--description <desc>', 'Task description')
  .action(async (name, options) => {
    try {
      await createTask({
        name,
        minimal: options.minimal || false,
        withGraph: options.withGraph || false,
        runner: options.runner || 'flow',
        inputs: options.inputs ? options.inputs.split(',') : [],
        description: options.description || ''
      });
    } catch (e) {
      console.error('Error:', e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  });

program
  .command('create-tool <name>')
  .description('Create a new tool')
  .option('--template <type>', 'Tool template: database, api, compute, validation', 'compute')
  .option('--description <desc>', 'Tool description')
  .option('--category <cat>', 'Tool category', 'Custom')
  .action(async (name, options) => {
    try {
      await createTool({
        name,
        template: options.template || 'compute',
        description: options.description || '',
        category: options.category || 'Custom'
      });
    } catch (e) {
      console.error('Error:', e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  });

program
  .command('create-app <name>')
  .description('Create a new app')
  .option('--template <type>', 'App template: blank, dashboard, task-explorer, flow-viz', 'blank')
  .option('--description <desc>', 'App description')
  .action(async (name, options) => {
    try {
      await createApp({
        name,
        template: options.template || 'blank',
        description: options.description || ''
      });
    } catch (e) {
      console.error('Error:', e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  });

program
  .command('create-flow <name>')
  .description('Create a new flow')
  .option('--states <n>', 'Number of states (1-20)', '3')
  .option('--description <desc>', 'Flow description')
  .action(async (name, options) => {
    try {
      await createFlow({
        name,
        states: options.states || '3',
        description: options.description || ''
      });
    } catch (e) {
      console.error('Error:', e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  });

program
  .command('run <taskName>')
  .description('Execute a task')
  .option('--input <json>', 'Input parameters as JSON')
  .option('--save', 'Save execution result')
  .option('--dry-run', 'Check syntax without executing')
  .option('-v, --verbose', 'Verbose output')
  .action(async (taskName, options) => {
    try {
      const input = options.input ? JSON.parse(options.input) : {};
      const result = await runTask({
        taskName,
        input,
        save: options.save || false,
        dryRun: options.dryRun || false,
        verbose: options.verbose || false
      });

      if (!options.dryRun) {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (e) {
      console.error('Error:', e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all tasks')
  .option('-v, --verbose', 'Show detailed info')
  .action(async (options) => {
    await listCommand(options);
  });

program
  .command('describe <taskName>')
  .description('Show task details')
  .action(async (taskName) => {
    await describeCommand(taskName);
  });

program
  .command('history <taskName>')
  .description('View execution history')
  .option('--limit <n>', 'Show last N runs', '10')
  .action((taskName, options) => {
    historyCommand(taskName, options);
  });

program
  .command('show <taskName> <runId>')
  .description('View a specific run result')
  .action((taskName, runId) => {
    showCommand(taskName, runId);
  });

program
  .command('delete <taskName>')
  .description('Delete a task')
  .option('--force', 'Skip confirmation')
  .action((taskName, options) => {
    deleteCommand(taskName, options);
  });

program
  .command('sync-tasks')
  .description('Sync tasks to configured storage')
  .option('--adaptor <type>', 'Storage adaptor to use', 'default')
  .option('--task <name>', 'Sync specific task')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    try {
      await syncTasks({
        adaptor: options.adaptor,
        task: options.task,
        verbose: options.verbose || false
      });
    } catch (e) {
      console.error('Error:', e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  });

program
  .command('config <action>')
  .description('Manage configuration')
  .option('--key <key>', 'Config key')
  .option('--value <value>', 'Config value')
  .action((action, options) => {
    try {
      switch (action) {
        case 'show':
          showConfig();
          break;
        case 'get':
          if (!options.key) {
            throw new Error('--key required for get');
          }
          const value = getConfig(options.key);
          console.log(value);
          break;
        case 'set':
          if (!options.key || !options.value) {
            throw new Error('--key and --value required for set');
          }
          setConfig(options.key, options.value);
          console.log(`✓ Set ${options.key} = ${options.value}`);
          break;
        default:
          throw new Error(`Unknown config action: ${action}`);
      }
    } catch (e) {
      console.error('Error:', e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize sequential-ecosystem with comprehensive examples')
  .option('--no-examples', 'Skip creating example tasks')
  .action(async (options) => {
    await initCommand(options);
  });

program
  .command('gui')
  .description('Launch Sequential Desktop GUI with full OS environment')
  .option('--port <port>', 'Server port', '8003')
  .option('--skip-setup', 'Skip setup check')
  .option('--no-zellous', 'Start without Zellous')
  .action(async (options) => {
    await guiCommand(options, __dirname);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
