import fs from 'fs';
import path from 'path';

export function showCommand(taskName, runId) {
  try {
    const runPath = path.join(process.cwd(), 'tasks', taskName, 'runs', `${runId}.json`);

    if (!fs.existsSync(runPath)) {
      throw new Error(`Run '${runId}' not found`);
    }

    const runData = JSON.parse(fs.readFileSync(runPath, 'utf-8'));
    console.log(JSON.stringify(runData, null, 2));
  } catch (e) {
    console.error('Error:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
