/**
 * state-kit-exec.js - StateKit process execution
 *
 * Command execution with optional OCI container support
 */

const { spawn } = require('child_process');
const { OCIExecutor } = require('./oci-executor');

function createExecFunction(workdir, opts = {}) {
  const useOCI = opts.useOCI || process.env.USE_OCI === 'true';
  const ociImage = opts.ociImage || process.env.OCI_IMAGE || 'ubuntu:24.04';
  const ociRuntime = opts.ociRuntime || process.env.OCI_RUNTIME || 'docker';

  let executor = null;
  if (useOCI) {
    executor = new OCIExecutor({ image: ociImage, runtime: ociRuntime });
  }

  return function _exec(cmd) {
    if (useOCI && executor) {
      return executor.exec(cmd, { workdir });
    }

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
