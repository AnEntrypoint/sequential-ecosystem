import * as crypto from 'crypto';
import * as request from 'request';
import * as urlModule from 'url';
import { URL, URLSearchParams } from 'url';

import { DockerCredentialHelpers } from './credentials-helper.js';

export class RegistryClient {
  constructor(registry, repository, auth) {
    this._auth = auth;
    this._registry = registry;
    this._repository = repository;
    this._protocol = 'https';
    const hostname = new URL('http://' + registry).hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      this._protocol = 'http';
    }
  }

  tags() {
    return new Promise((resolve, reject) => {
      request.get(
          {
            url: `${this._protocol}://${this._registry}/v2/${
                this._repository}/tags/list`,
            headers: {
              Authorization: this.authHeader(),
              Accept: 'application/vnd.docker.distribution.manifest.v2+json'
            }
          },
          (err, res, body) => {
            if (err) return reject(err);
            try {
              return resolve(JSON.parse(body + ''));
            } catch (e) {
              reject(e);
            }
          });
    });
  }

  manifest(tag) {
    return new Promise((resolve, reject) => {
      const url = `${this._protocol}://${this._registry}/v2/${
          this._repository}/manifests/${tag}`;

      request.get(
          url, {
            headers: {
              Authorization: this.authHeader(),
              Accept: 'application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.docker.distribution.manifest.v2+json'
            }
          },
          (err, res, body) => {
            if (err) return reject(err);
            try {
              const parsed = JSON.parse(body + '');

              if (res.statusCode === 200) {
                if (parsed.manifests && parsed.mediaType && (
                  parsed.mediaType === 'application/vnd.oci.image.index.v1+json' ||
                  parsed.mediaType === 'application/vnd.docker.distribution.manifest.list.v2+json'
                )) {
                  const arch = process.arch === 'x64' ? 'amd64' : process.arch;
                  const platform = parsed.manifests.find((m) =>
                    m.platform && m.platform.os === 'linux' &&
                    m.platform.architecture === arch
                  ) || parsed.manifests[0];

                  return this.manifest(platform.digest).then(resolve).catch(reject);
                }

                if (parsed.config) {
                  resolve(parsed);
                } else {
                  reject(new Error(
                      'unexpected manifest format from ' + url +
                      ' - no config field and not a manifest list' +
                      ')  response ' + body));
                }
              } else {
                reject(new Error(
                    'unexpected status code ' + res.statusCode +
                    ' from docker registry (' + url +
                    ' , and auth?: ' + (this.authHeader() ? true : false) +
                    ')  response ' + body));
              }
            } catch (e) {
              reject(e);
            }
          });
    });
  }

  manifestUpload(tag, manifest) {
    return new Promise((resolve, reject) => {
      const manifestBuf = Buffer.isBuffer(manifest) ?
          manifest :
          Buffer.from(JSON.stringify(manifest));

      const digest = 'sha256:' +
          crypto.createHash('sha256').update(manifestBuf).digest('hex');
      if (!tag) {
        tag = digest;
      }

      const req = request.put(
          `${this._protocol}://${this._registry}/v2/${
              this._repository}/manifests/${tag}`,
          {
            headers: {
              Authorization: this.authHeader(),
              'content-type':
                  'application/vnd.docker.distribution.manifest.v2+json'
            }
          },
          (err, res, body) => {
            if (err) {
              return reject(err);
            }

            if (res.statusCode !== 200 && res.statusCode !== 201) {
              return reject(new Error(
                  'unexpected status code ' + req.url + ' ' + res.statusCode +
                  ' ' + body));
            }

            resolve({
              status: res.statusCode,
              digest,
              body
            });
          });

      req.end(manifestBuf);
    });
  }

  blobExists(digest) {
    const url = `${this._protocol}://${this._registry}/v2/${
        this._repository}/blobs/${digest}`;
    const opts = {url, headers: {Authorization: this.authHeader()}};

    return new Promise((resolve, reject) => {
      request.head(opts, (err, res) => {
        if (err) reject(err);
        resolve(res.statusCode === 200);
      });
    });
  }

  blob(digest, stream) {
    return new Promise((resolve, reject) => {
      const url = `${this._protocol}://${this._registry}/v2/${
          this._repository}/blobs/${digest}`;
      let loop = 0;
      const fetch = (url) => {
        if (loop++ === 5) {
          return reject(new Error('redirect looped 5 times ' + url));
        }

        const opts = {
          url,
          headers: {Authorization: this.authHeader()},
          followRedirect: false
        };

        if (url.indexOf(`${this._protocol}://${this._registry}`) === -1) {
          delete opts.headers.Authorization;
        }

        if (stream) {
          const req = request.get(opts);
          req.on('response', (res) => {
            if (res.headers.location) {
              res.on('error', () => {});
              res.on('data', () => {});
              return fetch(urlModule.resolve(url, res.headers.location));
            }

            res.on('error', reject);
            if (res.statusCode !== 200) {
              res.on('data', () => {});
              reject(new Error(
                  'unexpected status code ' + url + ' ' + res.statusCode +
                  ' streaming blob'));
              return;
            }
            res.pause();
            resolve(res);
          });
          req.on('error', reject);
          return;
        }
        request.get(opts, (err, res, body) => {
          if (err) return reject(err);

          if (res.headers.location) {
            return fetch(urlModule.resolve(url, res.headers.location));
          }

          if (res.statusCode !== 200) {
            return reject(new Error(
                'unexpected status code for ' + opts.url + ' ' +
                res.statusCode + ' ' + body));
          }
          return resolve(body);
        });
      };
      fetch(url);
    });
  }

  upload(blob, contentLength, digest) {
    if (!isBuffer(blob)) {
      blob.pause();
    } else {
      if (!contentLength) contentLength = blob.length;
      if (!digest) {
        digest =
            'sha256:' + crypto.createHash('sha256').update(blob).digest('hex');
      }
    }

    return new Promise((resolve, reject) => {
      request.post(
          {
            url: `${this._protocol}://${this._registry}/v2/${
                this._repository}/blobs/uploads/`,
            headers: {Authorization: this.authHeader(), 'Content-Length': 0}
          },
          (err, res, body) => {
            if (err) {
              return reject(err);
            }

            if (!res.headers.location) {
              return reject(new Error(
                  'did not get location header to complete upload from upload post.'));
            }

            let uploadLocation = new URL(res.headers.location);

            if (contentLength && digest) {
              uploadLocation.searchParams.set('digest', digest);
              const putReq = request.put(
                  {
                    url: uploadLocation + '',
                    headers: {
                      Authorization: this.authHeader(),
                      'Content-Length': contentLength,
                      'Content-Type': 'application/octet-stream'
                    }
                  },
                  (err, res, body) => {
                    if (err) {
                      return reject(err);
                    }

                    if (res.statusCode !== 201) {
                      return reject(new Error(
                          'unexpected status code ' + res.statusCode +
                          ' for upload. ' + body));
                    }

                    resolve({
                      contentLength: contentLength + 0,
                      digest: res.headers['docker-content-digest'] + ''
                    });
                  });

              if (!isBuffer(blob)) {
                blob.pipe(putReq);
              } else {
                putReq.end(blob);
              }
              return;
            }

            contentLength = 0;

            const hash = crypto.createHash('sha256');

            const patchReq = request(
                {
                  method: 'PATCH',
                  uri: uploadLocation + '',
                  headers: {
                    Authorization: this.authHeader(),
                    'Content-Type': 'application/octet-stream'
                  }
                },
                (err, res, body) => {
                  if (err) return reject(err);
                  if (res.statusCode !== 204 && res.statusCode !== 202) {
                    return reject(new Error(
                        'unexpected status code ' + res.statusCode +
                        ' for patch upload (111)' +
                        `${uploadLocation} ${body}`));
                  }

                  if (res.headers.location) {
                    uploadLocation = new URL(res.headers.location);
                  }

                  const digest = 'sha256:' + hash.digest('hex');
                  uploadLocation.searchParams.set('digest', digest);
                  const resp = request(
                      {
                        method: 'PUT',
                        url: uploadLocation + '',
                        headers: {
                          Authorization: this.authHeader(),
                          'Content-Length': 0,
                          'Content-Type': 'application/octet-stream'
                        }
                      },
                      (err, res, body) => {
                        if (err) return reject(err);
                        if (res.statusCode !== 201) {
                          return reject(new Error(
                              'unexpected status code ' + res.statusCode +
                              ' for upload finalization'));
                        }

                        resolve({contentLength: contentLength, digest});
                      });
                  if (resp) resp.end();
                });

            if (isBuffer(blob)) {
              patchReq.end(blob);
              hash.update(blob);
              contentLength += blob.length;
            } else {
              blob.pipe(patchReq);
              blob.resume();
              blob.on('data', (b) => {
                hash.update(b);
                contentLength += b.length;
              });
            }
          });
    });
  }

  mount(digest, fromRepository) {
    return new Promise((resolve, reject) => {
      request(
          {
            method: 'POST',
            uri: `${this._protocol}://${this._registry}/v2/${
                this._repository}/blobs/uploads?mount=${digest}&from=${
                fromRepository}`,
            headers: {Authorization: this.authHeader(), 'Content-Length': 0}
          },
          (err, res, body) => {
            if (err) return reject(err);
            if (res.statusCode !== 201) {
              return reject(new Error(`mount failed for ${digest} from ${
                  fromRepository} to ${this._repository}`));
            }
            resolve(body + '');
          });
    });
  }

  authHeader() {
    if (!this._auth) {
      return undefined;
    }

    if (this._auth.token) {
      return `Bearer ${this._auth.token}`;
    } else {
      return 'Basic ' +
          Buffer.from(this._auth.Username + ':' + this._auth.Secret)
              .toString('base64');
    }
  }
}

function isBuffer(v) {
  return Buffer.isBuffer(v);
}
