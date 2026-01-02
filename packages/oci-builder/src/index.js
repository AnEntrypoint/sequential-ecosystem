import * as crypto from 'crypto';
import * as retry from 'p-retry';
import * as zlib from 'zlib';

import { handler as dockerAuth } from './auth/dockerio.js';
import { handler as gcrAuth } from './auth/gcr.js';
import { DockerCredentialHelpers } from './credentials-helper.js';
import { parse as parseSpecifier } from './image-specifier.js';
import * as packer from './packer.js';
import { pending } from './pending.js';
import { RegistryClient } from './registry.js';

export { RegistryClient } from './registry.js';

export class Image {
  constructor(
      imageSpecifier, targetImage,
      options) {
    this.options = options || {};

    if (typeof targetImage !== 'string') {
      this.options = this.options || targetImage;
      targetImage = undefined;
    }

    this.image = parseSpecifier(imageSpecifier);
    this.targetImage = parseSpecifier(targetImage || imageSpecifier);

    this.pending = pending();
    this.clients = {};

    const readOnly =
        this.authKey(this.image) !== this.authKey(this.targetImage);

    this.client(this.image, !readOnly)
        .catch(
            () => {
            });

    this.imageData = false;
  }

  async getImageConfig() {
    const imageData = await this.getImageData();
    return imageData.config.config;
  }

  async addLayer(
      digest, uncompressedDigest, size,
      urls) {
    const imageData = await this.getImageData();
    let layerMediaType = 'application/vnd.oci.image.layer.v1.tar+gzip';
    if (imageData.manifest.mediaType.indexOf('docker') > -1) {
      layerMediaType = 'application/vnd.docker.image.rootfs.diff.tar.gzip';
    }

    const layerResult = {mediaType: layerMediaType, digest, size, urls};

    imageData.manifest.layers.push(layerResult);
    imageData.config.rootfs.diff_ids.push(uncompressedDigest);

    return Object.assign({}, layerResult, {uncompressedDigest});
  }

  async removeLayer(digest) {
    const imageData = await this.getImageData();
    const layers = imageData.manifest.layers;
    let found;
    layers.forEach((layerData, i) => {
      if (layerData.digest === digest) {
        found = i;
      }
    });
    if (found !== undefined) {
      layers.splice(found, 1);
      imageData.config.rootfs.diff_ids.splice(found, 1);
      return true;
    }
    return false;
  }

  addFiles(
      dir,
      targetDir,
      options) {
    if (typeof targetDir === 'string') {
      if (typeof dir !== 'string') {
        throw new Error(
            'specifying a target directory name when the dir is an object of name:target doesn\'t make sense. try addFiles({dir:target})');
      }
      dir = {[targetDir]: dir};
    } else if (targetDir) {
      options = targetDir;
    }

    let p = new Promise(async (resolve, reject) => {
      const tarStream = packer.pack(dir, options);

      tarStream.on('error', (e) => reject(e));

      const gzip = zlib.createGzip();

      const uncompressedHash = crypto.createHash('sha256');

      tarStream.on('data', (buf) => {
        uncompressedHash.update(buf);
      });

      tarStream.pipe(gzip);

      const client = await this.client(this.targetImage, true);
      const result = await client.upload(gzip);

      const uncompressedDigest = 'sha256:' + uncompressedHash.digest('hex');

      resolve(await this.addLayer(
          result.digest, uncompressedDigest, result.contentLength));
    });

    p = this.pending.track(p);

    return p;
  }

  async getImageData() {
    if (!this.imageData) {
      this.imageData = await this.loadImageData();
      this.originalManifest =
          JSON.parse(JSON.stringify(this.imageData.manifest));
    }
    return this.imageData;
  }

  async loadImageData(image) {
    image = (image ? image : this.image);
    const client = await this.client(image);
    const manifest = await client.manifest(image.tag || 'latest');

    const configBlob = await client.blob(manifest.config.digest) + '';
    const config = JSON.parse(configBlob);

    return {manifest, config};
  }

  client(_image, write) {
    let image;
    if (typeof _image === 'string') {
      image = parseSpecifier(_image);
    } else {
      image = _image;
    }

    image = (image ? image : this.image);

    const scope = write ? 'push,pull' : 'pull';
    let key = [image.registry, image.namespace, image.image].join(',');

    const writeKey = key + ',push,pull';
    const readKey = key + ',pull';

    if (this.clients[writeKey]) {
      return this.clients[writeKey];
    } else if (!write && this.clients[readKey]) {
      return this.clients[readKey];
    }

    key += ',' + scope;
    const promiseOfClient =
        auth(image, scope, this.options.auth || {}).then((registryAuth) => {
          const registryClient = new RegistryClient(
              image.registry, this.nameSpacedImageName(image), registryAuth);
          return registryClient;
        });

    this.clients[key] = promiseOfClient;
    return promiseOfClient;
  }

  async save(tags, options) {
    const targetImage = this.targetImage;
    const client = await this.client(targetImage, true);
    const imageData = await this.getImageData();

    tags = tags || [targetImage.tag || 'latest'];
    options = options || {};

    await this.syncBaseImage(options);

    await Promise.all(this.pending.active());

    if (options.Cmd || this.Cmd) {
      imageData.config.config.Cmd = options.Cmd || this.Cmd;
    }

    if (options.Env || this.Env) {
      imageData.config.config.Env =
          imageData.config.config.Env.concat(options.Env || this.Env || []);
    }

    if (options.WorkingDir || this.WorkingDir) {
      imageData.config.config.WorkingDir =
          options.WorkingDir || this.WorkingDir;
    }

    const uploadResult =
        await client.upload(Buffer.from(JSON.stringify(imageData.config)));
    imageData.manifest.config.digest = uploadResult.digest;
    imageData.manifest.config.size = uploadResult.contentLength;
    return Promise
        .all(tags.filter((v) => !!v).map((tag) => {
          return client.manifestUpload(
              encodeURIComponent(tag), imageData.manifest);
        }))
        .then((results) => {
          return results[0];
        });
  }

  authKey(image) {
    if (image.registry.indexOf('gcr.io')) {
      return [image.registry, image.namespace].join(',');
    }
    return [image.registry, image.namespace, image.image].join(',');
  }

  async sync(options) {
    options =
        Object.assign({copyRemoteLayers: true, ignoreExists: false}, options);
    await this.getImageData();
    const manifest = this.originalManifest;
    if (!manifest) {
      throw new Error(
          'get image data failed to populate originalManifest somehow.');
    }
    const client = await this.client(this.image);
    const targetClient = await this.client(this.targetImage, true);
    const copies = [];
    manifest.layers.forEach((layer) => {
      if (!options.copyRemoteLayers && layer.urls) {
        return;
      }
      const p = targetClient.blobExists(layer.digest).then((exists) => {
        if (!exists || options.ignoreExists) {
          const action = () => {
            return new Promise(async (resolve, reject) => {
              const stream = await client.blob(layer.digest, true);

              let bytes = 0;
              stream.on('data', (b) => {
                bytes += b.length;
              });

              stream.on('end', () => {
                if (bytes !== layer.size) {
                  reject(Error(
                      'failed to get all of the bytes from the blob stream.'));
                }
              });

              stream.on('error', (err) => {
                reject(err);
              });
              try {
                resolve(await targetClient.upload(
                    stream, layer.size, layer.digest));
              } catch (e) {
                console.error(
                    'error syncing layer ' + layer.digest +
                    ' to target registry:\n' + e);
                reject(e);
              }
            });
          };
          return retry(action, {retries: 3}).then(() => true);
        }
        return true;
      });
      copies.push(p);
    });

    const all = Promise.all(copies);
    this.pending.track(all);
    return all;
  }

  async syncBaseImage(options) {
    const sameRegistry = this.image.registry === this.targetImage.registry;
    const sameProject = this.image.namespace === this.targetImage.namespace;
    if (sameRegistry && sameProject) {
      return;
    }
    if (this.syncedBaseImage) {
      return;
    }
    this.syncedBaseImage = true;
    return this.sync(options);
  }

  nameSpacedImageName(image) {
    image = (image ? image : this.image);
    return (image.namespace ? image.namespace + '/' : '') + image.image;
  }
}

export const auth = async (
    imageArg, scope, options) => {
  let image;
  if (typeof imageArg === 'string') {
    image = parseSpecifier(imageArg);
  } else {
    image = imageArg;
  }

  try {
    if (image.registry.indexOf('gcr.io') > -1) {
      return await gcrAuth(
          image, scope,
          options ? options[image.registry + '/' + image.namespace] ||
                  options['registry'] || options['gcr.io'] || {} :
                    {});
    } else if (image.registry.indexOf('docker.io') > -1) {
      return await dockerAuth(
          image, scope, options ? options['docker.io'] : undefined);
    }
  } catch (e) {
    console.error(
        'gcr or docker.io auth threw.\n' + e +
        '\n falling back to cred helpers.');
  }

  if (options) {
    const checked = ['gcr.io', 'docker.io'];
    let providedAuth;
    Object.keys(options).forEach((s) => {
      if (!checked.includes(s)) {
        if (image.registry.indexOf(s) > -1) {
          providedAuth = options[s];
        }
      }
    });

    if (providedAuth) {
      return providedAuth;
    }
  }

  const credHelpers = new DockerCredentialHelpers();
  const res = await credHelpers.auth(image.registry);

  return res;
};

export const pack = packer.pack;

export const CustomFile = packer.CustomFile;
