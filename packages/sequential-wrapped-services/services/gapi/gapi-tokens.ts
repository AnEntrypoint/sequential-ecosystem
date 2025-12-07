import logger from 'tasker-logging'
import { getCredentials, getAdminEmail } from './gapi-credentials.ts'

const tokenCache = new Map<string, { token: string; expiry: number }>();
const TOKEN_REFRESH_BUFFER = 300000;

export async function getAccessToken(scopes: string[], impersonateUser?: string): Promise<string> {
  const scopeKey = [...scopes].sort().join(',') + (impersonateUser ? `|${impersonateUser}` : '');
  const now = Date.now();
  const cachedData = tokenCache.get(scopeKey);

  if (cachedData && cachedData.expiry > now + TOKEN_REFRESH_BUFFER) {
    logger.debug('Using cached token', { scopeKey });
    return cachedData.token;
  }

  logger.debug('Generating new token', { scopeKey });
  const creds = await getCredentials();
  const adminEmail = await getAdminEmail();
  const subjectEmail = impersonateUser || adminEmail;
  logger.debug('Impersonating user', { subjectEmail });

  try {
    const header = { alg: "RS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: creds.client_email,
      scope: scopes.join(' '),
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
      sub: subjectEmail
    };

    const encodeBase64 = (str: string) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const jwtHeader = encodeBase64(JSON.stringify(header));
    const jwtPayload = encodeBase64(JSON.stringify(payload));
    const jwtData = `${jwtHeader}.${jwtPayload}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(jwtData);

    const privateKeyPem = creds.private_key.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\s/g, '');
    const privateKeyDer = Uint8Array.from(atob(privateKeyPem), c => c.charCodeAt(0));

    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyDer.buffer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureArrayBuffer = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, data);
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureArrayBuffer))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const jwt = `${jwtData}.${signature}`;

    logger.debug('Exchanging JWT for access token');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to get access token: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) throw new Error('No access token received');

    const expiresAt = Date.now() + (tokenData.expires_in * 1000);
    tokenCache.set(scopeKey, { token: tokenData.access_token, expiry: expiresAt });

    const expiryDate = new Date(expiresAt).toISOString();
    logger.info('Generated new token', { expiresAt: expiryDate });
    return tokenData.access_token;
  } catch (error) {
    logger.error('Token generation failed', { error: (error as Error).message });
    throw new Error(`Failed to generate access token: ${(error as Error).message}`);
  }
}

export function getTokenCache() {
  return tokenCache;
}

export function getCacheInfo() {
  return Array.from(tokenCache.entries()).map(([scope, data]) => ({
    scope,
    expires: new Date(data.expiry).toISOString(),
    valid: data.expiry > Date.now()
  }));
}

export function clearTokenCache(scope?: string) {
  if (scope) {
    tokenCache.delete(scope);
  } else {
    tokenCache.clear();
  }
}
