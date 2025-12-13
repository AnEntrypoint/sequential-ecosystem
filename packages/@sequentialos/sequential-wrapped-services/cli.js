#!/usr/bin/env node

/**
 * Tasker Wrapped Services CLI
 *
 * Discovers and starts available wrapped services based on local folder structure.
 * Supports Deno, Node.js, and Bun runtimes.
 *
 * Usage:
 *   npx tasker                    # Auto-discover and start all services
 *   npx tasker --port 3000        # Start on specific base port
 *   npx tasker --services gapi,keystore  # Start only specific services
 *   npx tasker --deno            # Force Deno runtime
 */

import logger from '@sequentialos/sequential-logging';
import { parseArgs, filterServices, assignPorts } from './src/service-config.js';
import { discoverServices } from './src/service-discovery.js';
import { startServices } from './src/service-startup.js';

async function main() {
  const args = process.argv.slice(2);
  const config = parseArgs(args);

  const discovery = discoverServices();
  const { services: allServices, servicesDir } = discovery;
  const filtered = filterServices(allServices, config);
  const assigned = assignPorts(filtered, config);

  if (assigned.length === 0) {
    logger.error('❌ No services found to start');
    process.exit(1);
  }

  await startServices(assigned, servicesDir, config);
}

main().catch(err => {
  logger.error('❌ Error:', err.message);
  process.exit(1);
});
