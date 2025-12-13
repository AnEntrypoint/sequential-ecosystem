#!/usr/bin/env node

import logger from '@sequentialos/sequential-logging';
import { parseArgs, printHelp } from './src/cli-args.js';
import { createService } from './src/cli-service-creator.js';

async function main() {
  const args = parseArgs();

  if (!args.library) {
    logger.info(printHelp());
    process.exit(0);
  }

  logger.info(`🔧 Creating zero-code wrapper for: ${args.library}\n`);
  await createService(args);
}

main().catch(err => {
  logger.error('❌ Error:', err.message);
  process.exit(1);
});
