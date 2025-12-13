/**
 * cli-utils.js - CLI utilities and help text
 *
 * Help message and error handling
 */

import logger from '@sequentialos/sequential-logging';

export function showHelp() {
  logger.info(`sequential-machine - persistent compute through content-addressable layers

Commands:
  run <cmd>        Run command and capture state as layer
  exec <cmd>       Run command without capturing state
  batch <file>     Run instructions from JSON array file

  history          Show layer history
  status           Show uncommitted changes in workdir
  diff [from] [to] Show changes between layers

  checkout <ref>   Restore workdir to a layer
  tag <name> [ref] Create named reference to a layer
  tags             List all tags
  inspect <ref>    Show layer details

  rebuild          Rebuild workdir from layers
  reset            Clear all state
  head             Show current head

Refs can be: full hash, short hash (12+ chars), or tag name

Environment:
  SEQUENTIAL_MACHINE_DIR     State directory (default: .sequential-machine)
  SEQUENTIAL_MACHINE_WORK    Working directory (default: .sequential-machine/work)
`);
}

export function exit(msg) {
  logger.error(msg);
  process.exit(1);
}
