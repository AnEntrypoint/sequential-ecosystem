import path from 'path';
import { readJsonFiles } from '@sequential/file-operations';
import fs from 'fs-extra';

export async function historyCommand(taskName, options) {
  try {
    const taskFile = path.join(process.cwd(), 'tasks', `${taskName}.js`);
    const runsDir = path.join(process.cwd(), 'tasks', taskName, 'runs');

    if (!await fs.pathExists(taskFile)) {
      throw new Error(`Task '${taskName}' not found`);
    }

    if (!await fs.pathExists(runsDir)) {
      console.log('No execution history');
      return;
    }

    const results = await readJsonFiles(runsDir);
    const runs = results
      .filter(r => r.content)
      .map(r => ({
        id: r.content.id,
        status: r.content.status,
        completedAt: r.content.completedAt
      }))
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, parseInt(options.limit));

    console.log(`Execution history for ${taskName}:`);
    for (const run of runs) {
      console.log(`  ${run.id.substring(0, 8)}... [${run.status}] ${run.completedAt}`);
    }
  } catch (e) {
    console.error('Error:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
