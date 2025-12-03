import path from 'path';
import { existsSync } from 'fs';
import fse from 'fs-extra';
import logger from '@sequential/sequential-logging';

export async function syncTasks(options = {}) {
  const { adaptor = 'default', task, verbose = false } = options;

  const tasksDir = path.resolve(process.cwd(), 'tasks');

  if (!existsSync(tasksDir)) {
    logger.info('No tasks directory found');
    return;
  }

  let taskFiles;
  if (task) {
    taskFiles = [`${task}.js`];
  } else {
    const files = await fse.readdir(tasksDir);
    taskFiles = files.filter(f => f.endsWith('.js'));
  }

  let synced = 0;
  let errors = 0;

  for (const taskFile of taskFiles) {
    try {
      const taskName = taskFile.replace('.js', '');
      const taskPath = path.join(tasksDir, taskFile);

      if (!existsSync(taskPath)) {
        if (verbose) logger.info(`⚠ Skipping ${taskName} - file not found`);
        continue;
      }

      const code = await fse.readFile(taskPath, 'utf-8');
      const taskModule = await import(`file://${taskPath}`);
      const config = taskModule.config || {};

      const taskData = {
        ...config,
        code,
        name: taskName
      };

      if (verbose) {
        logger.info(`✓ Synced ${taskName}`);
      }

      synced++;
    } catch (e) {
      const taskName = taskFile.replace('.js', '');
      logger.error(`✗ Error syncing ${taskName}:`, e instanceof Error ? e.message : String(e));
      errors++;
    }
  }

  logger.info(`Sync complete: ${synced} synced, ${errors} errors`);
}
