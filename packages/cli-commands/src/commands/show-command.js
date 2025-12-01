import path from 'path';
import { readJsonFile } from '@sequential/file-operations';

export async function showCommand(taskName, runId) {
  try {
    const runPath = path.join(process.cwd(), 'tasks', taskName, 'runs', `${runId}.json`);
    const runData = await readJsonFile(runPath);
    console.log(JSON.stringify(runData, null, 2));
  } catch (e) {
    console.error('Error:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
