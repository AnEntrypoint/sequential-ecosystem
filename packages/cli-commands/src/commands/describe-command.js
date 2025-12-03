import path from 'path';
import { createCLICommand } from '@sequential/cli-handler';
import { existsSync } from 'fs';
import logger from '@sequential/sequential-logging';

export async function describeCommand(taskName) {
  try {
    const taskFile = path.join(process.cwd(), 'tasks', `${taskName}.js`);

    if (!existsSync(taskFile)) {
      throw new Error(`Task '${taskName}' not found at ${taskFile}`);
    }

    const taskModule = await import(`file://${taskFile}`);
    const config = taskModule.config || {};

    logger.info(`Task: ${taskName}`);
    logger.info(`Description: ${config.description || 'N/A'}`);
    logger.info(`Created: ${config.created || 'N/A'}`);
    logger.info(`ID: ${config.id || 'N/A'}`);
    if (config.inputs?.length > 0) {
      logger.info('Inputs:');
      for (const input of config.inputs) {
        logger.info(`  - ${input.name} (${input.type}): ${input.description}`);
      }
    }
  } catch (e) {
    logger.error('Error:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
