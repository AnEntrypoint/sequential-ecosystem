export async function withRetry(fn, options = {}) {
  const {
    maxAttempts = 3,
    delayMs = 100,
    backoffMultiplier = 2,
    timeout = null,
    onRetry = null
  } = options;

  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = timeout
        ? await Promise.race([
          fn(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ])
        : await fn();
      return result;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
        if (onRetry) {
          onRetry(attempt, delay, error);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

export async function withTimeout(fn, ms) {
  return Promise.race([
    fn(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    )
  ]);
}

export function debounce(fn, ms) {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

export function throttle(fn, ms) {
  let lastCall = 0;
  return function throttled(...args) {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      return fn(...args);
    }
  };
}

export async function batchProcess(items, fn, batchSize = 10) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((item, idx) => fn(item, i + idx)));
    results.push(...batchResults);
  }
  return results;
}

export async function retry(fn, options = {}) {
  return withRetry(fn, options);
}

export async function parallel(tasks) {
  return Promise.all(tasks);
}

export async function sequence(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}

export function createLock() {
  let locked = false;
  const queue = [];

  return async function acquire(fn) {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        locked = true;
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          locked = false;
          const next = queue.shift();
          if (next) {
            next();
          }
        }
      };

      if (!locked) {
        execute();
      } else {
        queue.push(execute);
      }
    });
  };
}

export async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function memoize(fn, ttl = null) {
  const cache = new Map();

  return function memoized(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      const { value, timestamp } = cache.get(key);
      if (!ttl || Date.now() - timestamp < ttl) {
        return value;
      }
      cache.delete(key);
    }

    const result = fn(...args);
    cache.set(key, { value: result, timestamp: Date.now() });
    return result;
  };
}
