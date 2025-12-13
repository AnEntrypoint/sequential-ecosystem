const { spawn } = require('child_process');

class OCIExecutor {
  constructor(opts = {}) {
    this.runtime = opts.runtime || 'docker';
    this.image = opts.image || 'ubuntu:24.04';
    this.pullImage = opts.pullImage !== false;
  }

  async ensureImage() {
    if (!this.pullImage) return;
    return new Promise((resolve, reject) => {
      const proc = spawn(this.runtime, ['pull', this.image]);
      proc.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`Failed to pull image: ${this.image}`));
      });
    });
  }

  async exec(cmd, opts = {}) {
    const workdir = opts.workdir || '/tmp';
    const env = opts.env || process.env;

    await this.ensureImage();

    return new Promise((resolve, reject) => {
      const args = [
        'run',
        '--rm',
        '-w', workdir,
        ...Object.entries(env).flatMap(([k, v]) => ['-e', `${k}=${v}`]),
        this.image,
        'sh', '-c', cmd
      ];

      let stdout = '';
      let stderr = '';

      const proc = spawn(this.runtime, args);

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
  }
}

module.exports = { OCIExecutor };
