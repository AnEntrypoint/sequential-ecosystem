import * as request from 'request';

export const handler = (image, scope, options) => {
  const headers = {};
  if (options) {
    if (options.Secret && options.Username) {
      headers['Authorization'] = 'Basic ' +
          Buffer.from(options.Username + ':' + options.Secret)
              .toString('base64');
    } else if (options.token) {
      headers['Authorization'] = 'Bearer ' + options.token;
    }
  }
  return new Promise((resolve, reject) => {
    request(
        {
          method: 'GET',
          url:
              'https://auth.docker.io/token?service=registry.docker.io&scope=repository:' +
              (image.namespace ? image.namespace + '/' : '') + image.image +
              ':' + scope,
          headers
        },
        (err, res, body) => {
          if (err) return reject(err);
          if (res.statusCode !== 200) {
            return reject(new Error(
                'unexpected status code ' + res.statusCode +
                ' authenticating with docker.io'));
          }

          try {
            resolve(JSON.parse(body + ''));
          } catch (e) {
            reject(e);
          }
        });
  });
};
