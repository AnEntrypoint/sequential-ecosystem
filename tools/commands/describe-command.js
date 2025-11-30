import fs from 'fs';
import path from 'path';

export async function describeCommand(taskName) {
  try {
    const taskFile = path.join(process.cwd(), 'tasks', `${taskName}.js`);

    if (!fs.existsSync(taskFile)) {
      throw new Error(`Task '${taskName}' not found at ${taskFile}`);
    }

    const taskModule = await import(`file://${taskFile}`);
    const config = taskModule.config || {};

    console.log(`Task: ${taskName}`);
    console.log(`Description: ${config.description || 'N/A'}`);
    console.log(`Created: ${config.created || 'N/A'}`);
    console.log(`ID: ${config.id || 'N/A'}`);
    if (config.inputs?.length > 0) {
      console.log('Inputs:');
      for (const input of config.inputs) {
        console.log(`  - ${input.name} (${input.type}): ${input.description}`);
      }
    }
  } catch (e) {
    console.error('Error:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
