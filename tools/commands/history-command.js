import fs from 'fs';
import path from 'path';

export function historyCommand(taskName, options) {
  try {
    const taskFile = path.join(process.cwd(), 'tasks', `${taskName}.js`);
    const runsDir = path.join(process.cwd(), 'tasks', taskName, 'runs');

    if (!fs.existsSync(taskFile)) {
      throw new Error(`Task '${taskName}' not found`);
    }

    if (!fs.existsSync(runsDir)) {
      console.log('No execution history');
      return;
    }

    const runs = fs.readdirSync(runsDir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const data = JSON.parse(fs.readFileSync(path.join(runsDir, f), 'utf-8'));
        return {
          id: data.id,
          status: data.status,
          completedAt: data.completedAt
        };
      })
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
