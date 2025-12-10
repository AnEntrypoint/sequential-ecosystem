import path from 'path';
import { createCLICommand } from '@sequential/cli-handler';
import { readJsonFile } from 'file-operations';
import logger from '@sequential/sequential-logging';

export const showCommand = createCLICommand(async (taskName, runId) => {
  const runPath = path.join(process.cwd(), 'tasks', taskName, 'runs', `${runId}.json`);
  const runData = await readJsonFile(runPath);
  logger.info(JSON.stringify(runData, null, 2));
});
