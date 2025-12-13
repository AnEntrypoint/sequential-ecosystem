export function createResponseUnwrapper() {
  const originalFetch = typeof fetch !== 'undefined' ? fetch : null;

  function unwrapResponse(response) {
    if (!response) return response;
    if (typeof response !== 'object') return response;
    if (response.success === false) {
      const error = new Error(response.error?.message || 'API error');
      error.code = response.error?.code;
      error.full = response;
      throw error;
    }
    return response.data !== undefined ? response.data : response;
  }

  async function wrappedFetch(url, options = {}) {
    if (!originalFetch) throw new Error('fetch not available in this environment');

    const response = await originalFetch(url, options);
    const json = await response.json();
    const unwrapped = unwrapResponse(json);

    return {
      ok: response.ok,
      status: response.status,
      json: async () => unwrapped,
      data: unwrapped,
      full: json,
      text: async () => JSON.stringify(unwrapped),
      blob: async () => new Blob([JSON.stringify(unwrapped)]),
      headers: response.headers,
      clone: () => response.clone(),
      arrayBuffer: async () => new TextEncoder().encode(JSON.stringify(unwrapped)).buffer
    };
  }

  function installGlobalFetch() {
    if (typeof window !== 'undefined') {
      window.fetch = wrappedFetch;
    }
  }

  return {
    unwrap: unwrapResponse,
    fetch: wrappedFetch,
    install: installGlobalFetch,
    createFetchWrapper: (baseUrl) => {
      return async (path, options = {}) => {
        const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
        const response = await wrappedFetch(url, options);
        return response.data;
      };
    }
  };
}

export function initializeResponseUnwrapping() {
  const unwrapper = createResponseUnwrapper();
  unwrapper.install();
  return unwrapper;
}
