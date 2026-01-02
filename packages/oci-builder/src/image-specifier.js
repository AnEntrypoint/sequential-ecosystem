const DEFAULT_REGISTRY_ALIAS = 'docker.io';

export const parse = (specifier) => {
  const parts = specifier.split('/');

  const match = /([^/]+\/)?(.+\/)?([^/]+)?$/;
  let matches = specifier.match(match);

  if (!matches) {
    throw new Error('invalid image specifier: ' + specifier);
  }
  matches.shift();
  matches = matches.filter((v) => v);

  const trimSlashes = /^\/|\/$/g;

  let image = matches[matches.length - 1];
  if (image) image = image.replace(trimSlashes, '');

  let namespace = matches[matches.length - 2];
  if (namespace) namespace = namespace.replace(trimSlashes, '');

  let registry = matches[matches.length - 3];
  if (registry) registry = registry.replace(trimSlashes, '');

  if (!registry) {
    registry = namespace;
    namespace = undefined;
  }

  if (registry === DEFAULT_REGISTRY_ALIAS || !registry) {
    namespace = namespace || 'library';
    registry = 'index.docker.io';
  }

  if (registry.indexOf('docker.io') > -1 && !namespace) {
    namespace = 'library';
  }

  const imageProps = {};

  ['@', ':'].forEach((c) => {
    if (image.indexOf(c) > -1) {
      const imageParts = image.split(c);
      imageProps[c] = imageParts.pop() || '';
      image = imageParts.join(c);
    }
  });

  const digest = imageProps['@'];
  const tag = imageProps[':'] || 'latest';

  const protocol = boldlyAssumeProtocol(registry);

  return {protocol, registry, namespace, image, tag, digest};
};

function boldlyAssumeProtocol(registry) {
  if (/.*\.local(?:host)?(?::\d{1,5})?$/.test(registry)) return 'http';
  if (registry.indexOf('localhost:') > -1) return 'http';
  if (registry.indexOf('127.0.0.1') > -1) return 'http';
  if (registry.indexOf('::1') > -1) return 'http';
  return 'https';
}
