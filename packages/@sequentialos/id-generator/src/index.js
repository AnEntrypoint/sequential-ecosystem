/**
 * @module id-generator
 * ID generation utilities for Sequential OS
 */

import { randomBytes } from 'node:crypto';

/**
 * Character set for ID generation (alphanumeric)
 * Excludes similar-looking characters (0/O, 1/l/I) for better readability
 */
const CHARSET = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Get random values using the best available random source
 * @param {Uint8Array} array - Array to fill with random values
 */
function getSecureRandomValues(array) {
  // Try Web Crypto API first (browser)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
    return;
  }

  // Try Node.js crypto.webcrypto (Node.js 15+)
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(array);
    return;
  }

  // Use Node.js crypto module (already imported)
  const bytes = randomBytes(array.length);
  array.set(bytes);
}

/**
 * Generate a random ID with optional prefix
 * @param {string} prefix - Optional prefix for the ID (e.g., 'task', 'user')
 * @param {number} length - Length of the random portion (default: 9)
 * @returns {string} Generated ID (e.g., 'task_a3k9m2x7p' or 'a3k9m2x7p')
 *
 * @example
 * generateId() // => 'a3k9m2x7p'
 * generateId('task') // => 'task_a3k9m2x7p'
 * generateId('user', 12) // => 'user_h8j2k9m4n7p3'
 */
export function generateId(prefix = '', length = 9) {
  if (length < 1) {
    throw new Error('ID length must be at least 1');
  }

  // Generate random ID using cryptographically secure random values
  let id = '';
  const values = new Uint8Array(length);

  // Fill with secure random values
  getSecureRandomValues(values);

  for (let i = 0; i < length; i++) {
    id += CHARSET[values[i] % CHARSET.length];
  }

  // Add prefix if provided
  if (prefix && typeof prefix === 'string' && prefix.length > 0) {
    return `${prefix}_${id}`;
  }

  return id;
}

/**
 * Generate a batch of IDs with the same prefix
 * @param {number} count - Number of IDs to generate
 * @param {string} prefix - Optional prefix for all IDs
 * @param {number} length - Length of the random portion (default: 9)
 * @returns {string[]} Array of generated IDs
 *
 * @example
 * generateBatch(5, 'task') // => ['task_a3k9m2x7p', 'task_h8j2k9m4n', ...]
 */
export function generateBatch(count, prefix = '', length = 9) {
  if (count < 1) {
    throw new Error('Batch count must be at least 1');
  }

  const ids = [];
  for (let i = 0; i < count; i++) {
    ids.push(generateId(prefix, length));
  }
  return ids;
}
