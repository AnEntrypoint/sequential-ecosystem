import path from 'path';
import { existsSync } from 'fs';
import fse from 'fs-extra';

export async function deleteCommand(taskName, options) {
  try {
    const taskDir = path.join(process.cwd(), 'tasks', taskName);

    if (!existsSync(taskDir)) {
      throw new Error(`Task '${taskName}' not found`);
    }

    if (!options.force) {
      console.log(`Delete task '${taskName}'? This cannot be undone.`);
      console.log('Use --force to skip confirmation');
      return;
    }

    await fse.remove(taskDir);
    console.log(`✓ Task '${taskName}' deleted`);
  } catch (e) {
    console.error('Error:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
