import path from 'path';
import { writeFileAtomicString } from '@sequential/file-operations';
import logger from '@sequential/sequential-logging';

export async function createAdvancedToolExamples(toolsDir) {
  const tools = [
    {
      name: 'cache-manager.js',
      content: `export const config = {
  name: 'cache-manager',
  description: 'In-memory cache with TTL support'
};

const cache = new Map();
const ttls = new Map();

export async function set(key, value, ttlSeconds = 3600) {
  cache.set(key, value);
  if (ttlSeconds) {
    const expiry = Date.now() + (ttlSeconds * 1000);
    ttls.set(key, expiry);
  }
  return { success: true, key, stored: true };
}

export async function get(key) {
  const expiry = ttls.get(key);
  if (expiry && Date.now() > expiry) {
    cache.delete(key);
    ttls.delete(key);
    return { success: false, key, error: 'Key expired' };
  }
  const value = cache.get(key);
  return {
    success: value !== undefined,
    key,
    value,
    found: value !== undefined
  };
}

export async function delete(key) {
  const had = cache.has(key);
  cache.delete(key);
  ttls.delete(key);
  return { success: true, key, deleted: had };
}

export async function clear() {
  const count = cache.size;
  cache.clear();
  ttls.clear();
  return { success: true, cleared: count };
}

export async function size() {
  return { success: true, count: cache.size };
}

export async function list() {
  const keys = Array.from(cache.keys());
  return { success: true, keys, count: keys.length };
}
`
    },
    {
      name: 'validator-helper.js',
      content: `export const config = {
  name: 'validator-helper',
  description: 'Reusable validation utilities'
};

export async function email(value) {
  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  const valid = regex.test(value);
  return { valid, value, error: valid ? null : 'Invalid email format' };
}

export async function url(value) {
  try {
    new URL(value);
    return { valid: true, value, error: null };
  } catch {
    return { valid: false, value, error: 'Invalid URL format' };
  }
}

export async function number(value, min, max) {
  const num = Number(value);
  if (isNaN(num)) {
    return { valid: false, value, error: 'Not a number' };
  }
  if (min !== undefined && num < min) {
    return { valid: false, value, error: \`Must be >= \${min}\` };
  }
  if (max !== undefined && num > max) {
    return { valid: false, value, error: \`Must be <= \${max}\` };
  }
  return { valid: true, value: num, error: null };
}

export async function length(value, minLen, maxLen) {
  const len = String(value).length;
  if (minLen !== undefined && len < minLen) {
    return { valid: false, value, error: \`Min length is \${minLen}\` };
  }
  if (maxLen !== undefined && len > maxLen) {
    return { valid: false, value, error: \`Max length is \${maxLen}\` };
  }
  return { valid: true, value, error: null };
}

export async function batch(validations) {
  const results = {};
  let allValid = true;
  for (const [key, rule] of Object.entries(validations)) {
    const [type, ...args] = Array.isArray(rule) ? rule : [rule];
    if (typeof this[type] === 'function') {
      results[key] = await this[type](...args);
      if (!results[key].valid) allValid = false;
    }
  }
  return { success: allValid, results, valid: allValid };
}
`
    },
    {
      name: 'rate-limiter.js',
      content: `export const config = {
  name: 'rate-limiter',
  description: 'Rate limiting and throttling utilities'
};

const buckets = new Map();

export async function checkLimit(key, limit = 10, windowSeconds = 60) {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  if (!buckets.has(key)) {
    buckets.set(key, []);
  }

  const timestamps = buckets.get(key);
  const validTimestamps = timestamps.filter(t => now - t < windowMs);
  buckets.set(key, validTimestamps);

  if (validTimestamps.length >= limit) {
    const oldestTime = validTimestamps[0];
    const resetTime = new Date(oldestTime + windowMs);
    return {
      allowed: false,
      key,
      count: validTimestamps.length,
      limit,
      resetTime
    };
  }

  validTimestamps.push(now);
  return {
    allowed: true,
    key,
    count: validTimestamps.length,
    limit,
    remaining: limit - validTimestamps.length
  };
}

export async function reset(key) {
  const had = buckets.has(key);
  buckets.delete(key);
  return { success: true, key, reset: had };
}

export async function status(key) {
  const timestamps = buckets.get(key) || [];
  return {
    key,
    count: timestamps.length,
    timestamps
  };
}
`
    }
  ];

  for (const tool of tools) {
    const filePath = path.join(toolsDir, tool.name);
    await writeFileAtomicString(filePath, tool.content);
    logger.info(`  ✓ Created ${tool.name}`);
  }
}
