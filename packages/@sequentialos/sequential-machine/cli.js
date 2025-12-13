#!/usr/bin/env node
/**
 * cli.js - Sequential Machine CLI Facade
 *
 * Delegates to focused modules:
 * - cli-commands: Command handlers (run, exec, batch, history, etc.)
 * - cli-utils: Help text and error handling
 */

import { StateKit } from './lib/index.js';
import { createCommandHandler, formatBytes } from './cli-commands.js';
import { showHelp, exit } from './cli-utils.js';

const args = process.argv.slice(2);

const kit = new StateKit({
  stateDir: process.env.SEQUENTIAL_MACHINE_DIR || '.sequential-machine',
  workdir: process.env.SEQUENTIAL_MACHINE_WORK || undefined
});

async function main() {
  const handler = createCommandHandler(kit, args);
  const handled = await handler();

  if (!handled) {
    showHelp();
  }
}

main().catch(err => {
  exit(err.message);
});
