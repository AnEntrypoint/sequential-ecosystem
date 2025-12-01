import path from 'path';
import fs from 'fs-extra';
import { BaseRepository } from './base-repository.js';

export class TaskRepository extends BaseRepository {
  constructor(baseDir = null) {
    super(baseDir || path.join(process.cwd(), 'tasks'), 'Task');
  }

  getConfig(taskName) {
    const taskDir = this.validatePath(taskName);
    const configPath = path.join(taskDir, 'config.json');
    return this.readJsonFile(configPath, 'config');
  }

  getCode(taskName) {
    const taskDir = this.validatePath(taskName);
    const codePath = path.join(taskDir, 'code.js');
    if (!fs.existsSync(codePath)) {
      throw this.createError(`Task code not found`, 404, 'NOT_FOUND');
    }
    return fs.readFileSync(codePath, 'utf8');
  }

  saveRun(taskName, runId, runData) {
    const taskDir = this.validatePath(taskName);
    const runsDir = path.join(taskDir, 'runs');
    fs.ensureDirSync(runsDir);
    const runPath = path.join(runsDir, `${runId}.json`);
    fs.writeFileSync(runPath, JSON.stringify(runData, null, 2));
  }

  getRuns(taskName) {
    const taskDir = this.validatePath(taskName);
    const runsDir = path.join(taskDir, 'runs');
    if (!fs.existsSync(runsDir)) {
      return [];
    }
    return fs.readdirSync(runsDir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        try {
          return JSON.parse(fs.readFileSync(path.join(runsDir, f), 'utf8'));
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getRun(taskName, runId) {
    const taskDir = this.validatePath(taskName);
    const runPath = path.join(taskDir, 'runs', `${runId}.json`);
    return this.readJsonFile(runPath, 'run');
  }
}
