/**
 * @module route-helpers/query
 * Query parameter parsing helpers
 */

/**
 * Parse sort parameter into field and direction
 * @param {string} sortParam - Sort parameter (e.g., 'name', '-createdAt', '+priority')
 * @returns {Object} {field: string, direction: 'asc' | 'desc'}
 */
export function parseSort(sortParam) {
  if (!sortParam || typeof sortParam !== 'string') {
    return { field: null, direction: 'asc' };
  }

  let field = sortParam;
  let direction = 'asc';

  // Check for leading + or - to indicate direction
  if (sortParam.startsWith('-')) {
    direction = 'desc';
    field = sortParam.slice(1);
  } else if (sortParam.startsWith('+')) {
    direction = 'asc';
    field = sortParam.slice(1);
  }

  return {
    field: field || null,
    direction
  };
}
