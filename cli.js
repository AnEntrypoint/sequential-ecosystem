#!/usr/bin/env node

import { program } from 'commander';
import { createTask } from './tools/create-task.js';
import { syncTasks } from './tools/sync-tasks.js';
import { runTask } from './tools/run-task.js';
import { getConfig, setConfig, showConfig } from './tools/config.js';
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
  .description('Sequential task execution with xstate integration')
  .version(pkg.version || '1.0.0');

program
  .command('create-task <name>')
  .description('Create a new task')
  .option('--with-graph', 'Create with explicit state graph (xstate FlowState)')
  .option('--inputs <inputs>', 'Comma-separated input parameters')
  .option('--description <desc>', 'Task description')
  .action(async (name, options) => {
    try {
      await createTask({
        name,
        withGraph: options.withGraph || false,
        inputs: options.inputs ? options.inputs.split(',') : [],
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
    try {
      const tasksDir = path.join(process.cwd(), 'tasks');
      if (!fs.existsSync(tasksDir)) {
        console.log('No tasks found');
        return;
      }

      const tasks = fs.readdirSync(tasksDir)
        .filter(f => f.endsWith('.js'))
        .map(f => f.replace('.js', ''));

      if (tasks.length === 0) {
        console.log('No tasks found');
        return;
      }

      console.log('Tasks:');
      for (const task of tasks) {
        const taskFile = path.join(tasksDir, `${task}.js`);
        try {
          const taskModule = await import(`file://${taskFile}`);
          const config = taskModule.config || {};
          if (options.verbose) {
            console.log(`\n${task}:`);
            console.log(`  Description: ${config.description || 'N/A'}`);
            console.log(`  Inputs: ${config.inputs?.length || 0}`);
          } else {
            console.log(`  - ${task}`);
          }
        } catch {
          console.log(`  - ${task}`);
        }
      }
    } catch (e) {
      console.error('Error:', e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  });

program
  .command('describe <taskName>')
  .description('Show task details')
  .action(async (taskName) => {
    try {
      const taskFile = path.join(process.cwd(), 'tasks', `${taskName}.js`);

      if (!fs.existsSync(taskFile)) {
        throw new Error(`Task '${taskName}' not found at ${taskFile}`);
      }

      const taskModule = await import(`file://${taskFile}`);
      const config = taskModule.config || {};

      console.log(`Task: ${taskName}`);
      console.log(`Description: ${config.description || 'N/A'}`);
      console.log(`Created: ${config.created || 'N/A'}`);
      console.log(`ID: ${config.id || 'N/A'}`);
      if (config.inputs?.length > 0) {
        console.log('Inputs:');
        for (const input of config.inputs) {
          console.log(`  - ${input.name} (${input.type}): ${input.description}`);
        }
      }
    } catch (e) {
      console.error('Error:', e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  });

program
  .command('history <taskName>')
  .description('View execution history')
  .option('--limit <n>', 'Show last N runs', '10')
  .action((taskName, options) => {
    try {
      const taskFile = path.join(process.cwd(), 'tasks', `${taskName}.js`);
      const runsDir = path.join(process.cwd(), 'tasks', taskName, 'runs');

      if (!fs.existsSync(taskFile)) {
        throw new Error(`Task '${taskName}' not found`);
      }

      if (!fs.existsSync(runsDir)) {
        console.log('No execution history');
        return;
      }

      const runs = fs.readdirSync(runsDir)
        .filter(f => f.endsWith('.json'))
        .map(f => {
          const data = JSON.parse(fs.readFileSync(path.join(runsDir, f), 'utf-8'));
          return {
            id: data.id,
            status: data.status,
            completedAt: data.completedAt
          };
        })
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, parseInt(options.limit));

      console.log(`Execution history for ${taskName}:`);
      for (const run of runs) {
        console.log(`  ${run.id.substring(0, 8)}... [${run.status}] ${run.completedAt}`);
      }
    } catch (e) {
      console.error('Error:', e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  });

program
  .command('show <taskName> <runId>')
  .description('View a specific run result')
  .action((taskName, runId) => {
    try {
      const runPath = path.join(process.cwd(), 'tasks', taskName, 'runs', `${runId}.json`);

      if (!fs.existsSync(runPath)) {
        throw new Error(`Run '${runId}' not found`);
      }

      const runData = JSON.parse(fs.readFileSync(runPath, 'utf-8'));
      console.log(JSON.stringify(runData, null, 2));
    } catch (e) {
      console.error('Error:', e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  });

program
  .command('delete <taskName>')
  .description('Delete a task')
  .option('--force', 'Skip confirmation')
  .action((taskName, options) => {
    try {
      const taskDir = path.join(process.cwd(), 'tasks', taskName);

      if (!fs.existsSync(taskDir)) {
        throw new Error(`Task '${taskName}' not found`);
      }

      if (!options.force) {
        console.log(`Delete task '${taskName}'? This cannot be undone.`);
        console.log('Use --force to skip confirmation');
        return;
      }

      fs.rmSync(taskDir, { recursive: true });
      console.log(`✓ Task '${taskName}' deleted`);
    } catch (e) {
      console.error('Error:', e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
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
  .description('Initialize sequential-ecosystem in current directory')
  .action(() => {
    try {
      const paths = [
        path.join(process.cwd(), 'tasks'),
        path.join(process.cwd(), 'tools')
      ];

      for (const p of paths) {
        if (!fs.existsSync(p)) {
          fs.mkdirSync(p, { recursive: true });
          console.log(`✓ Created ${p}`);
        }
      }

      const configFile = path.join(process.cwd(), '.sequentialrc.json');
      if (!fs.existsSync(configFile)) {
        fs.writeFileSync(configFile, JSON.stringify({
          adaptor: 'default',
          defaults: {}
        }, null, 2));
        console.log(`✓ Created ${configFile}`);
      }

      console.log('\n✓ Initialized sequential-ecosystem');
      console.log('Create a task: npx sequential-ecosystem create-task <name>');
      console.log('Run a task: npx sequential-ecosystem run <name> --input \'{}\'');
    } catch (e) {
      console.error('Error:', e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
