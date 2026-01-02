import * as spawn from 'cross-spawn';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

const defaultPath = path.join(
    process.env.HOME || process.env.USERPROFILE || '', '.docker',
    'config.json');

export class DockerCredentialHelpers {
  constructor(customPathOrConfig) {
    if (typeof customPathOrConfig === 'string' || !customPathOrConfig) {
      this.readDockerConfig(customPathOrConfig);
    } else {
      this.dockerConfig = customPathOrConfig || {};
    }
  }

  auth(registry) {
    const host = url.parse(registry).host || registry;
    return new Promise((resolve, reject) => {
      if (!this.dockerConfig.credHelpers ||
          !this.dockerConfig.credHelpers[host]) {
        reject(new Error('no auth handler for ' + host));
      }
      const helper = 'docker-credential-' + this.dockerConfig.credHelpers[host];

      let endCount = 0;
      const bufs = [];
      const ebufs = [];

      let maybeEnd = (err) => {
        if (err) {
          maybeEnd = () => {};
          return reject(err);
        }

        endCount++;
        if (endCount === 2) {
          resolve((json(Buffer.concat(bufs)) || {}));
        }
      };
      const proc = spawn(helper, ['get']);
      proc.on('exit', (code) => {
        if (code) {
          return reject(new Error(
              'exit code ' + code + ' from docker credential helper ' + helper +
              '\nstderr: ' + Buffer.concat(ebufs) + ''));
        }
        maybeEnd();
      });

      proc.stdout.on('data', (b) => bufs.push(b))
          .on('end', maybeEnd)
          .on('error', maybeEnd);

      proc.stderr.on('data', (b) => ebufs.push(b)).on('error', maybeEnd);
      proc.stdin.end(host);
    });
  }

  readDockerConfig(customPath) {
    try {
      this.dockerConfig =
          (JSON.parse(
               fs.readFileSync(
                   customPath ||
                   (process.env.DOCKER_CONFIG ?
                        path.join(process.env.DOCKER_CONFIG, 'config.json') :
                        false) ||
                   defaultPath) +
               '') ||
           {});
    } catch (e) {
    }
    return this.dockerConfig;
  }

  getDockerConfig() {
    return this.dockerConfig;
  }

  setDockerConfig(config) {
    this.dockerConfig = config || {};
  }
}

function json(s) {
  try {
    return JSON.parse(s + '');
  } catch (e) {
  }
}
