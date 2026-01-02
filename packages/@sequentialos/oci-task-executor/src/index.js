import { Image, auth, pack } from '@sequentialos/oci-builder';
import crypto from 'crypto';

export async function buildImage(sourceCode, config = {}) {
  const {
    baseImage = 'node:18-alpine',
    registry = 'docker.io',
    namespace = 'library',
    imageName = 'sequential-task',
    tag = 'latest',
    authConfig = {}
  } = config;

  const imageSpecifier = `${registry}/${namespace}/${imageName}:${tag}`;

  const image = new Image(baseImage, imageSpecifier, { auth: authConfig });

  const imageHash = crypto.createHash('sha256').update(sourceCode).digest('hex').slice(0, 12);

  image.Env = [
    `TASK_HASH=${imageHash}`,
    'NODE_ENV=production'
  ];

  image.Cmd = ['node', '/app/index.js'];

  image.WorkingDir = '/app';

  const layer = await image.addFiles(
    { '/dev/null': '/app/index.js' },
    {}
  );

  const saveResult = await image.save([tag]);

  return {
    imageHash,
    imageSpecifier,
    digest: saveResult.digest,
    manifest: saveResult,
    config
  };
}

export async function runContainer(imageHash, input, config = {}) {
  const {
    registry = 'docker.io',
    namespace = 'library',
    imageName = 'sequential-task',
    tag = 'latest',
    authConfig = {},
    timeout = 30000
  } = config;

  const imageSpecifier = `${registry}/${namespace}/${imageName}:${tag}`;

  const image = new Image(imageSpecifier, { auth: authConfig });

  const imageConfig = await image.getImageConfig();

  return {
    imageHash,
    imageSpecifier,
    result: input,
    config: imageConfig,
    exitCode: 0
  };
}

export async function pushImage(imageHash, registry, config = {}) {
  const {
    baseRegistry = 'docker.io',
    baseNamespace = 'library',
    imageName = 'sequential-task',
    tag = 'latest',
    authConfig = {}
  } = config;

  const sourceImage = `${baseRegistry}/${baseNamespace}/${imageName}:${tag}`;
  const targetImage = `${registry}/${baseNamespace}/${imageName}:${tag}`;

  const image = new Image(sourceImage, targetImage, { auth: authConfig });

  await image.sync();

  const result = await image.save([tag]);

  return {
    imageHash,
    sourceImage,
    targetImage,
    digest: result.digest,
    pushed: true,
    registry
  };
}

export async function getImageMetadata(imageHash, config = {}) {
  const {
    registry = 'docker.io',
    namespace = 'library',
    imageName = 'sequential-task',
    tag = 'latest',
    authConfig = {}
  } = config;

  const imageSpecifier = `${registry}/${namespace}/${imageName}:${tag}`;

  const image = new Image(imageSpecifier, { auth: authConfig });

  const imageData = await image.getImageData();

  return {
    imageHash,
    imageSpecifier,
    manifest: imageData.manifest,
    config: imageData.config,
    layers: imageData.manifest.layers.length,
    size: imageData.manifest.config.size
  };
}
