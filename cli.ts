#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { startSystem } from './lib/system-services.js';
import { createTask, setupGapi } from './lib/task-manager.js';
import { showHelp, init } from './lib/utils.js';

const program = new Command();

program
  .name('sequential-ecosystem')
  .description('Sequential Ecosystem - Task execution with automatic suspend/resume')
  .version('1.0.0');

program
  .command('start')
  .description('Start the sequential ecosystem system')
  .option('-p, --port <number>', 'Port to run the server on', '3000')
  .option('-d, --debug', 'Enable debug logging')
  .action(async (options) => {
    if (options.debug) {
      process.env.DEBUG = 'true';
    }
    process.env.PORT = options.port;
    await startSystem();
  });

program
  .command('create-task <name>')
  .description('Create a new task')
  .option('-d, --description <text>', 'Task description', '')
  .action(async (name, options) => {
    await createTask(name, options.description);
  });

program
  .command('setup-gapi')
  .description('Set up GAPI task and configuration')
  .action(async () => {
    await setupGapi();
  });

program
  .command('init')
  .description('Initialize project directories')
  .action(async () => {
    await init();
  });

program.parse();
