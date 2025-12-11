/**
 * task-loader.js
 *
 * Load task files and locate task functions
 */

import path from 'path';
import { existsSync } from 'fs';
import fse from 'fs-extra';

export async function loadTaskFile(taskName) {
  const tasksDir = path.resolve(process.cwd(), 'tasks');
  const taskDataDir = path.join(tasksDir, taskName);
  const taskFile = path.join(taskDataDir, 'code.js');
  const legacyFile = path.join(tasksDir, `${taskName}.js`);

  let codeFile = taskFile;
  if (!existsSync(taskFile) && existsSync(legacyFile)) {
    codeFile = legacyFile;
  } else if (!existsSync(taskFile)) {
    throw new Error(`Task '${taskName}' not found at ${taskFile} or ${legacyFile}`);
  }

  const code = await fse.readFile(codeFile, 'utf-8');
  return { codeFile, code };
}

export async function importTaskModule(codeFile) {
  return await import(`file://${codeFile}`);
}

export function extractTaskFunction(taskModule, taskName, codeFile) {
  const funcName = taskName.replace(/-/g, '_');
  const taskFunction = taskModule[funcName] || taskModule[taskName] || taskModule.default;

  if (typeof taskFunction !== 'function') {
    throw new Error(`No function '${funcName}' or default export found in ${codeFile}`);
  }

  return taskFunction;
}

export function getTaskConfig(taskModule) {
  return taskModule.config || {};
}
