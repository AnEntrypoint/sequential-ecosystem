import path from 'path';
import { writeFileAtomicString } from 'file-operations';
import logger from '@sequential/sequential-logging';

export async function createExampleUtils(toolsDir) {
  const utils = {
    'async-helpers.js': `export async function withRetry(fn, maxAttempts = 3, delay = 1000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error;
      const backoff = delay * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, backoff));
    }
  }
}

export async function withTimeout(promise, timeoutMs = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    )
  ]);
}

export async function all(promises) {
  return Promise.all(promises);
}

export async function race(promises) {
  return Promise.race(promises);
}

export async function sequence(fns) {
  let result;
  for (const fn of fns) {
    result = await fn(result);
  }
  return result;
}

export async function parallel(fns, limit = 5) {
  const results = [];
  for (let i = 0; i < fns.length; i += limit) {
    const batch = fns.slice(i, i + limit);
    const batchResults = await Promise.all(batch.map(fn => fn()));
    results.push(...batchResults);
  }
  return results;
}
`,
    'error-helpers.js': `export class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class NotFoundError extends Error {
  constructor(resource, id) {
    super(\`\${resource} not found: \${id}\`);
    this.name = 'NotFoundError';
    this.resource = resource;
    this.id = id;
  }
}

export function handleError(error) {
  if (error instanceof ValidationError) {
    return {
      success: false,
      error: error.message,
      details: error.details,
      type: 'ValidationError'
    };
  }

  if (error instanceof NotFoundError) {
    return {
      success: false,
      error: error.message,
      resource: error.resource,
      type: 'NotFoundError'
    };
  }

  return {
    success: false,
    error: error.message || 'Unknown error',
    type: error.constructor.name
  };
}

export function validateRequired(value, fieldName) {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(\`\${fieldName} is required\`);
  }
  return value;
}

export function validateType(value, type, fieldName) {
  if (typeof value !== type) {
    throw new ValidationError(
      \`\${fieldName} must be \${type}\`,
      { expected: type, actual: typeof value }
    );
  }
  return value;
}
`,
    'format-helpers.js': `export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatDuration(ms) {
  if (ms < 1000) return ms + 'ms';
  if (ms < 60000) return Math.round(ms / 1000) + 's';
  if (ms < 3600000) return Math.round(ms / 60000) + 'm';
  return Math.round(ms / 3600000) + 'h';
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function truncate(str, length = 100) {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\\w\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-');
}
`
  };

  for (const [name, content] of Object.entries(utils)) {
    const filePath = path.join(toolsDir, name);
    await writeFileAtomicString(filePath, content);
    logger.info(`  ✓ Created ${name}`);
  }
}
