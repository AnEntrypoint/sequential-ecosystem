import path from 'path';
import fs from 'fs-extra';

export class TaskRepository {
  constructor(baseDir = null) {
    this.baseDir = baseDir || path.join(process.cwd(), 'tasks');
  }

  validatePath(taskName) {
    const taskDir = path.join(this.baseDir, taskName);
    const realPath = path.resolve(taskDir);
    if (!realPath.startsWith(path.resolve(this.baseDir))) {
      const err = new Error(`Access to task '${taskName}' denied`);
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }
    return taskDir;
  }

  getAll() {
    if (!fs.existsSync(this.baseDir)) {
      return [];
    }
    return fs.readdirSync(this.baseDir)
      .filter(f => fs.statSync(path.join(this.baseDir, f)).isDirectory())
      .map(name => {
        let result = { name, id: name };
        const configPath = path.join(this.baseDir, name, 'config.json');
        if (fs.existsSync(configPath)) {
          try {
            const content = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            result = { ...result, ...content };
          } catch (parseErr) {
            if (process.env.DEBUG) {
              console.warn(`Failed to parse ${configPath}: ${parseErr.message}`);
            }
          }
        }
        return result;
      });
  }

  getConfig(taskName) {
    const taskDir = this.validatePath(taskName);
    const configPath = path.join(taskDir, 'config.json');
    if (!fs.existsSync(configPath)) {
      const err = new Error(`Task '${taskName}' not found`);
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
      throw new Error(`Invalid task configuration: ${e.message}`);
    }
  }

  getCode(taskName) {
    const taskDir = this.validatePath(taskName);
    const codePath = path.join(taskDir, 'code.js');
    if (!fs.existsSync(codePath)) {
      const err = new Error(`Task '${taskName}' code not found`);
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
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
    if (!fs.existsSync(runPath)) {
      const err = new Error(`Run '${runId}' not found`);
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    try {
      return JSON.parse(fs.readFileSync(runPath, 'utf8'));
    } catch (e) {
      throw new Error(`Invalid run file: ${e.message}`);
    }
  }
}
