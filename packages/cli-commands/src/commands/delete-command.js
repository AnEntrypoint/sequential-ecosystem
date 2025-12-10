import path from 'path';
import { createCLICommand } from '@sequentialos/cli-handler';
import { existsSync } from 'fs';
import fse from 'fs-extra';
import logger from '@sequentialos/sequential-logging';

export const deleteCommand = createCLICommand(async (taskName, options) => {
  const taskDir = path.join(process.cwd(), 'tasks', taskName);
  if (!existsSync(taskDir)) throw new Error(`Task '${taskName}' not found`);
  if (!options.force) {
    logger.info(`Delete task '${taskName}'? This cannot be undone.`);
    logger.info('Use --force to skip confirmation');
    return;
  }
  await fse.remove(taskDir);
  logger.info(`✓ Task '${taskName}' deleted`);
});
