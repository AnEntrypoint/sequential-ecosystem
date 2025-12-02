import { spawn } from 'child_process';
import path from 'path';
import { EventEmitter } from 'events';

export class BackgroundTaskManager extends EventEmitter {
  constructor() {
    super();
    this.processes = new Map();
    this.nextId = 1;
  }

  spawn(command, args = [], options = {}) {
    const id = this.nextId++;
    const startTime = Date.now();
    const cwd = options.cwd || process.cwd();
    const env = { ...process.env, ...options.env };

    const childProcess = spawn(command, args, {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: options.detached !== false
    });

    let stdout = '';
    let stderr = '';

    if (childProcess.stdout) {
      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }

    if (childProcess.stderr) {
      childProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    const task = {
      id,
      pid: childProcess.pid,
      command,
      args,
      status: 'running',
      startTime,
      exitCode: null,
      signal: null,
      stdout,
      stderr,
      childProcess
    };

    childProcess.on('exit', (code, signal) => {
      task.status = code === 0 ? 'completed' : 'failed';
      task.exitCode = code;
      task.signal = signal;

      const eventType = code === 0 ? 'task:complete' : 'task:failed';
      this.emit(eventType, this.status(id));
    });

    childProcess.on('error', (error) => {
      task.status = 'failed';
      task.error = error.message;
      this.emit('task:failed', this.status(id));
    });

    this.processes.set(id, task);
    this.emit('task:start', { id, pid: childProcess.pid, command, args, startTime });
    return { id, pid: childProcess.pid };
  }

  status(id) {
    const task = this.processes.get(id);
    if (!task) {
      return null;
    }

    const now = Date.now();
    const duration = now - task.startTime;

    return {
      id: task.id,
      pid: task.pid,
      command: task.command,
      args: task.args,
      status: task.status,
      startTime: task.startTime,
      duration,
      exitCode: task.exitCode,
      signal: task.signal,
      error: task.error || null,
      stdoutLength: task.stdout.length,
      stderrLength: task.stderr.length
    };
  }

  list() {
    const result = [];
    for (const [id, task] of this.processes) {
      const now = Date.now();
      const duration = now - task.startTime;
      result.push({
        id,
        pid: task.pid,
        command: task.command,
        status: task.status,
        duration,
        startTime: task.startTime
      });
    }
    return result;
  }

  getOutput(id) {
    const task = this.processes.get(id);
    if (!task) {
      return null;
    }
    return {
      stdout: task.stdout,
      stderr: task.stderr
    };
  }

  kill(id) {
    const task = this.processes.get(id);
    if (!task) {
      return false;
    }

    if (task.status === 'running') {
      try {
        process.kill(-task.pid);
      } catch (e) {
        try {
          task.childProcess.kill();
        } catch (e2) {}
      }
      this.emit('task:killed', { id, pid: task.pid, command: task.command });
      return true;
    }

    return false;
  }

  async waitFor(id) {
    const task = this.processes.get(id);
    if (!task) {
      return null;
    }

    if (task.status !== 'running') {
      return this.status(id);
    }

    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const taskStatus = this.status(id);
        if (taskStatus && taskStatus.status !== 'running') {
          clearInterval(checkInterval);
          resolve(taskStatus);
        }
      }, 100);
    });
  }

  cleanup() {
    for (const [id, task] of this.processes) {
      if (task.status === 'running') {
        this.kill(id);
      }
    }
    this.processes.clear();
  }
}

export const backgroundTaskManager = new BackgroundTaskManager();
