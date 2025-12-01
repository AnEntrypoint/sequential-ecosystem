import path from 'path';
import fs from 'fs-extra';
import { BaseRepository } from './base-repository.js';
import {
  ensureDirectory,
  writeFileAtomicJson,
  readJsonFiles
} from '@sequential/file-operations';

export class TaskRepository extends BaseRepository {
  constructor(baseDir = null) {
    super(baseDir || path.join(process.cwd(), 'tasks'), 'Task');
  }

  async getConfig(taskName) {
    const taskDir = this.validatePath(taskName);
    const configPath = path.join(taskDir, 'config.json');
    return await this.readJsonFile(configPath, 'config');
  }

  getCode(taskName) {
    const taskDir = this.validatePath(taskName);
    const codePath = path.join(taskDir, 'code.js');
    if (!fs.existsSync(codePath)) {
      throw this.createError(`Task code not found`, 404, 'NOT_FOUND');
    }
    return fs.readFileSync(codePath, 'utf8');
  }

  async saveRun(taskName, runId, runData) {
    const taskDir = this.validatePath(taskName);
    const runsDir = path.join(taskDir, 'runs');
    await ensureDirectory(runsDir);
    const runPath = path.join(runsDir, `${runId}.json`);
    await writeFileAtomicJson(runPath, runData);
  }

  async getRuns(taskName) {
    const taskDir = this.validatePath(taskName);
    const runsDir = path.join(taskDir, 'runs');
    if (!fs.existsSync(runsDir)) {
      return [];
    }
    const results = await readJsonFiles(runsDir);
    return results
      .filter(r => r.content)
      .map(r => r.content)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getRun(taskName, runId) {
    const taskDir = this.validatePath(taskName);
    const runPath = path.join(taskDir, 'runs', `${runId}.json`);
    return await this.readJsonFile(runPath, 'run');
  }
}
