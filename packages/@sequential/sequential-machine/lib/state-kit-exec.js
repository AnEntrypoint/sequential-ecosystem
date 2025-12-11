/**
 * state-kit-exec.js - StateKit process execution
 *
 * Command execution and reference resolution
 */

const { spawn } = require('child_process');

function createExecFunction(workdir) {
  return function _exec(cmd) {
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      const proc = spawn('sh', ['-c', cmd], {
        cwd: workdir,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, HOME: workdir }
      });

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });

      proc.on('close', code => {
        if (code === 0) resolve({ stdout, stderr });
        else reject(new Error(`Command exited with ${code}: ${cmd}`));
      });

      proc.on('error', reject);
    });
  };
}

module.exports = { createExecFunction };
