export function createFetchWithRetry(options = {}) {
  const { maxRetries = 3, backoffMs = 100, timeout = 30000 } = options;

  return async function fetchWithRetry(url, fetchOptions = {}) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
          const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
          clearTimeout(timeoutId);
          if (!response.ok && attempt < maxRetries) {
            const delayMs = backoffMs * Math.pow(2, attempt);
            await new Promise(r => setTimeout(r, delayMs));
            continue;
          }
          return response;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries) {
          const delayMs = backoffMs * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, delayMs));
        }
      }
    }
    throw lastError || new Error(`Failed after ${maxRetries} retries`);
  };
}

export function createDefaultFetchClient(options = {}) {
  return createFetchWithRetry({ maxRetries: 3, backoffMs: 100, ...options });
}

export function createAggressiveRetryFetch(options = {}) {
  return createFetchWithRetry({ maxRetries: 5, backoffMs: 50, timeout: 10000, ...options });
}

export function createConservativeRetryFetch(options = {}) {
  return createFetchWithRetry({ maxRetries: 1, backoffMs: 200, timeout: 60000, ...options });
}
