/**
 * @module route-helpers/transform
 * Data transformation helpers
 */

/**
 * Normalize ID format (kebab-case to snake_case or vice versa)
 * @param {string} id - ID to normalize
 * @param {string} format - Target format: 'snake_case' or 'kebab-case' (default: 'kebab-case')
 * @returns {string} Normalized ID
 */
export function normalizeId(id, format = 'kebab-case') {
  if (!id || typeof id !== 'string') {
    return id;
  }

  if (format === 'snake_case') {
    // Convert kebab-case to snake_case
    return id.replace(/-/g, '_');
  } else if (format === 'kebab-case') {
    // Convert snake_case to kebab-case
    return id.replace(/_/g, '-');
  }

  return id;
}
