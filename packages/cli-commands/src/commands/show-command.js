import path from 'path';
import { createCLICommand } from '@sequentialos/cli-handler';
import { readJsonFile } from '@sequentialos/file-operations';
import logger from '@sequentialos/sequential-logging';

export const showCommand = createCLICommand(async (taskName, runId) => {
  const runPath = path.join(process.cwd(), 'tasks', taskName, 'runs', `${runId}.json`);
  const runData = await readJsonFile(runPath);
  logger.info(JSON.stringify(runData, null, 2));
});
