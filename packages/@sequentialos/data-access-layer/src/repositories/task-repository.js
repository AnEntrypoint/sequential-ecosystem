import path from 'path';
import fs from 'fs-extra';
import { BaseRepository } from './base-repository.js';
import {
  ensureDirectory,
  writeFileAtomicJson,
  readJsonFiles
} from '@sequentialos/file-operations';

export class TaskRepository extends BaseRepository {
  constructor(baseDir = null) {
    super(baseDir || path.join(process.cwd(), 'tasks'), 'Task');
  }

  async getConfig(taskName) {
    const taskDir = this.validatePath(taskName);
    const configPath = path.join(taskDir, 'config.json');
    return await this.readJsonFile(configPath, 'config');
  }

  async getCode(taskName) {
    const taskDir = this.validatePath(taskName);
    const codePath = path.join(taskDir, 'code.js');
    if (!await fs.pathExists(codePath)) {
      throw this.createError('Task code not found', 404, 'NOT_FOUND');
    }
    return await fs.readFile(codePath, 'utf8');
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
    if (!await fs.pathExists(runsDir)) {
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

  async get(taskName) {
    const config = await this.getConfig(taskName);
    const code = await this.getCode(taskName);
    return { config, code };
  }

  async saveCode(taskName, code) {
    const taskDir = this.validatePath(taskName);
    await ensureDirectory(taskDir);
    const codePath = path.join(taskDir, 'code.js');
    await fs.writeFile(codePath, code, 'utf8');
  }

  async saveConfig(taskName, config) {
    const taskDir = this.validatePath(taskName);
    await ensureDirectory(taskDir);
    const configPath = path.join(taskDir, 'config.json');
    await writeFileAtomicJson(configPath, config);
  }
}
