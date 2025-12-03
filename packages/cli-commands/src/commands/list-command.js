import path from 'path';
import { createCLICommand } from '@sequential/cli-handler';
import { existsSync } from 'fs';
import { listFiles } from '@sequential/file-operations';
import logger from '@sequential/sequential-logging';

export async function listCommand(options) {
  try {
    const tasksDir = path.join(process.cwd(), 'tasks');
    if (!existsSync(tasksDir)) {
      logger.info('No tasks found');
      return;
    }

    const taskFiles = await listFiles(tasksDir, { extensions: '.js' });
    const tasks = taskFiles.map(f => f.replace('.js', ''));

    if (tasks.length === 0) {
      logger.info('No tasks found');
      return;
    }

    logger.info('Tasks:');
    for (const task of tasks) {
      const taskFile = path.join(tasksDir, `${task}.js`);
      try {
        const taskModule = await import(`file://${taskFile}`);
        const config = taskModule.config || {};
        if (options.verbose) {
          logger.info(`\n${task}:`);
          logger.info(`  Description: ${config.description || 'N/A'}`);
          logger.info(`  Inputs: ${config.inputs?.length || 0}`);
        } else {
          logger.info(`  - ${task}`);
        }
      } catch {
        logger.info(`  - ${task}`);
      }
    }
  } catch (e) {
    logger.error('Error:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
