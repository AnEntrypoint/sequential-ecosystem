/**
 * @module route-helpers/query
 * Query parameter parsing helpers
 */

/**
 * Parse pagination parameters from query string
 * @param {Object} query - Express req.query object
 * @returns {Object} {page: number, pageSize: number, offset: number}
 */
export function parsePagination(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 20));
  const offset = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    offset
  };
}
