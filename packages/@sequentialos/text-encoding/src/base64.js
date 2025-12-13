export function encodeBase64(str) {
  if (typeof str !== 'string') return '';
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return Buffer.from(str, 'utf8').toString('base64');
  }
}

export function decodeBase64(str) {
  if (typeof str !== 'string') return '';
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return Buffer.from(str, 'base64').toString('utf8');
  }
}

export function encodeDataUrl(data, mimeType = 'application/octet-stream') {
  if (typeof data === 'string') {
    return `data:${mimeType};base64,${encodeBase64(data)}`;
  }
  const base64 = Buffer.isBuffer(data) ? data.toString('base64') : encodeBase64(String(data));
  return `data:${mimeType};base64,${base64}`;
}

export function decodeDataUrl(dataUrl) {
  if (!dataUrl || !dataUrl.startsWith('data:')) return null;

  const [header, data] = dataUrl.split(',');
  const mimeType = header.match(/data:([^;]+)/)?.[1] || 'application/octet-stream';
  const isBase64 = header.includes('base64');

  return {
    mimeType,
    data: isBase64 ? decodeBase64(data) : decodeURIComponent(data),
    isBase64
  };
}

export function isValidBase64(str) {
  if (!str || typeof str !== 'string') return false;
  try {
    atob(str);
    return true;
  } catch {
    try {
      Buffer.from(str, 'base64').toString('base64') === str;
      return true;
    } catch {
      return false;
    }
  }
}
