import { GoogleAuth } from 'google-auth-library';
import * as request from 'request';

export const handler = async(
    image, scope, options) => {

  if (options.token) {
    return {Username: '_token', Secret: options.token, token: options.token};
  }

  const resolvedOptions = {
    credentials: options.credentials,
    keyFilename: options.keyFilename
  };
  if (!('scopes' in resolvedOptions)) {
    resolvedOptions.scopes = scope.indexOf('push') > -1 ?
        'https://www.googleapis.com/auth/devstorage.read_write' :
        'https://www.googleapis.com/auth/devstorage.read_only';
  }

  const auth = new GoogleAuth(resolvedOptions);
  const client = await auth.getClient();
  const token = (await client.getAccessToken()).token || undefined;

  const authUrl = `https://${image.registry}/v2/token?service=gcr.io&scope=${
      encodeURIComponent(
          `repository:${image.namespace}/${image.image}:push,pull`)}`;

  return await new Promise((resolve, reject) => {
    request.get(
        {url: authUrl, headers: {Authorization: 'Bearer ' + token}},
        (err, res, body) => {
          if (err || res.statusCode !== 200) {
            reject(
                err ||
                new Error(
                    'unexpected statusCode ' + authUrl + ' ' + res.statusCode +
                    ' from gcr token request'));
          }
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
  });
};
