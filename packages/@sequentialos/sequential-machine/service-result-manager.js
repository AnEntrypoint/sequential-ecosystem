import logger from '@sequentialos/sequential-logging';
import fs from 'fs';
import path from 'path';
import { nowISO } from '@sequentialos/timestamp-utilities';

/**
 * Save service result to checkpoint file
 */
export function saveServiceResult(workdir, serviceName, method, params, result, instruction, layer) {
  const checkpointFile = `service-result-${serviceName}-${method}-${Date.now()}.json`;
  const checkpointPath = path.join(workdir, checkpointFile);

  fs.writeFileSync(checkpointPath, JSON.stringify({
    service: serviceName,
    method,
    params,
    result,
    instruction,
    layer,
    timestamp: nowISO()
  }, null, 2));

  logger.info(`💾 Service result saved to: ${checkpointFile}`);
  return checkpointFile;
}

/**
 * List all service result files in workdir
 */
export function listServiceResults(workdir) {
  if (!fs.existsSync(workdir)) {
    logger.info('📄 No service result files found');
    return [];
  }

  const files = fs.readdirSync(workdir).filter(f =>
    f.includes('-') && f.endsWith('.json')
  );

  if (files.length === 0) {
    logger.info('📄 No service result files found');
    return [];
  }

  logger.info('📄 Service Result Files:');
  logger.info('─'.repeat(40));

  for (const file of files.sort()) {
    const filePath = path.join(workdir, file);
    const stat = fs.statSync(filePath);
    const parts = file.replace('.json', '').split('-');
    const serviceName = parts[0];
    const method = parts[1];

    logger.info(`${file.padEnd(30)} ${serviceName}.${method} (${stat.size} bytes)`);
  }

  return files;
}

/**
 * Get service results in current layer
 */
export function getLayerServiceResults(workdir) {
  const files = fs.readdirSync(workdir).filter(f => f.startsWith('service-result-'));

  if (files.length > 0) {
    logger.info('📄 Service result files in current layer:');
    for (const file of files) {
      logger.info(`  - ${file}`);
    }
  }

  return files;
}
