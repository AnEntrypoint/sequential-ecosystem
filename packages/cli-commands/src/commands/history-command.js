import path from 'path';
import { readJsonFiles } from '@sequentialos/file-operations';
import fs from 'fs-extra';
import logger from '@sequentialos/sequential-logging';

export const historyCommand = async (taskName, options) => {
  const taskFile = path.join(process.cwd(), 'tasks', `${taskName}.js`);
  const runsDir = path.join(process.cwd(), 'tasks', taskName, 'runs');
  if (!await fs.pathExists(taskFile)) throw new Error(`Task '${taskName}' not found`);
  if (!await fs.pathExists(runsDir)) {
    logger.info('No execution history');
    return;
  }
  const results = await readJsonFiles(runsDir);
  const runs = results
    .filter(r => r.content)
    .map(r => ({ id: r.content.id, status: r.content.status, completedAt: r.content.completedAt }))
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, parseInt(options.limit));
  logger.info(`Execution history for ${taskName}:`);
  for (const run of runs) {
    logger.info(`  ${run.id.substring(0, 8)}... [${run.status}] ${run.completedAt}`);
  }
};
