import path from 'path';
import { existsSync } from 'fs';
import fse from 'fs-extra';
import logger from '@sequential/sequential-logging';

export async function deleteCommand(taskName, options) {
  try {
    const taskDir = path.join(process.cwd(), 'tasks', taskName);

    if (!existsSync(taskDir)) {
      throw new Error(`Task '${taskName}' not found`);
    }

    if (!options.force) {
      logger.info(`Delete task '${taskName}'? This cannot be undone.`);
      logger.info('Use --force to skip confirmation');
      return;
    }

    await fse.remove(taskDir);
    logger.info(`✓ Task '${taskName}' deleted`);
  } catch (e) {
    logger.error('Error:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
