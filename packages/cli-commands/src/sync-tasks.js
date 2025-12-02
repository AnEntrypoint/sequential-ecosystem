import path from 'path';
import { existsSync } from 'fs';
import fse from 'fs-extra';

export async function syncTasks(options = {}) {
  const { adaptor = 'default', task, verbose = false } = options;

  const tasksDir = path.resolve(process.cwd(), 'tasks');

  if (!existsSync(tasksDir)) {
    console.log('No tasks directory found');
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
        if (verbose) console.log(`⚠ Skipping ${taskName} - file not found`);
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
        console.log(`✓ Synced ${taskName}`);
      }

      synced++;
    } catch (e) {
      const taskName = taskFile.replace('.js', '');
      console.error(`✗ Error syncing ${taskName}:`, e instanceof Error ? e.message : String(e));
      errors++;
    }
  }

  console.log(`Sync complete: ${synced} synced, ${errors} errors`);
}
