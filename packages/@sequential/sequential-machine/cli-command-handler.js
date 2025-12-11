import logger from '@sequentialos/sequential-logging';
import fs from 'fs';

/**
 * Parse command line arguments and execute service call
 */
export async function handleCallCommand(args, client) {
  const serviceName = args[1];
  const method = args[2];

  if (!serviceName || !method) {
    throw new Error('Usage: sequential-machine call <service> <method> [params-json]');
  }

  let params = {};
  if (args[3]) {
    try {
      params = JSON.parse(args[3]);
    } catch (error) {
      throw new Error(`Invalid params JSON: ${error.message}`);
    }
  }

  await client.executeServiceCall(serviceName, method, params);
}

/**
 * Handle batch services command
 */
export async function handleBatchServicesCommand(args, client) {
  const file = args[1];
  if (!file) {
    throw new Error('Usage: sequential-machine batch-services <file.json>');
  }

  let instructions;
  try {
    instructions = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`Failed to parse batch file: ${error.message}`);
  }

  const results = await client.batchWithServices(instructions);

  for (const result of results) {
    const status = result.cached ? 'cached' : result.empty ? 'empty' : 'new';
    const serviceInfo = result.serviceResult ? ` [${result.serviceResult.service}.${result.serviceResult.method}]` : '';
    logger.info(`${result.short} [${status}]${serviceInfo}`);
  }
}

/**
 * Handle health check command
 */
export async function handleHealthCommand(args, client) {
  const serviceName = args[1];
  await client.checkServiceHealth(serviceName);
}

/**
 * Handle restore checkpoint command
 */
export async function handleRestoreCheckpointCommand(args, client) {
  const checkpointName = args[1];
  if (!checkpointName) {
    throw new Error('Usage: sequential-machine restore-checkpoint <name>');
  }

  await client.restoreFromServiceCheckpoint(checkpointName);
}

/**
 * Print help message
 */
export function printHelp() {
  logger.info(`sequential-machine - persistent compute with wrapped services integration

Service Commands:
  call <service> <method> [params]      Call service (writes result file → checkpoint)
  batch-services <file.json>             Execute batch with service calls
  services                               List available services
  health [service]                       Check service health
  results                                List service result files
  restore-checkpoint <name>              Restore from service checkpoint

Standard Commands:
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

Service Integration:
  Service calls automatically create checkpoints with format 'after-{service}-{method}'
  Results are saved to workdir as 'service-result-{service}-{method}-{timestamp}.json'

Environment:
  SEQUENTIAL_MACHINE_DIR     State directory (default: .sequential-machine)
  SEQUENTIAL_MACHINE_WORK    Working directory (default: .sequential-machine/work)
`);
}
