import fs from 'fs';
import path from 'path';

export const command = {
  name: 'list',
  description: 'List all tasks',
  options: [['-v, --verbose', 'Show detailed info']],
  action: async (options) => {
    const tasksDir = path.join(process.cwd(), 'tasks');
    if (!fs.existsSync(tasksDir)) {
      console.log('No tasks found');
      return;
    }

    const tasks = fs.readdirSync(tasksDir)
      .filter(f => f.endsWith('.js'))
      .map(f => f.replace('.js', ''));

    if (tasks.length === 0) {
      console.log('No tasks found');
      return;
    }

    console.log('Tasks:');
    for (const task of tasks) {
      const taskFile = path.join(tasksDir, `${task}.js`);
      try {
        const taskModule = await import(`file://${taskFile}`);
        const config = taskModule.config || {};
        if (options.verbose) {
          console.log(`\n${task}:`);
          console.log(`  Description: ${config.description || 'N/A'}`);
          console.log(`  Inputs: ${config.inputs?.length || 0}`);
        } else {
          console.log(`  - ${task}`);
        }
      } catch {
        console.log(`  - ${task}`);
      }
    }
  }
};
