/**
 * @sequentialos/response-formatting
 * Standardized API response formatting utilities
 */

/**
 * Format a standard success response
 * @param {Object} data - The response payload
 * @param {Object} [meta] - Optional metadata
 * @returns {Object} Formatted response
 */
export function formatResponse(data, meta = {}) {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

/**
 * Format a paginated list response
 * @param {Array} items - The items to return
 * @param {number} count - Total count of items
 * @param {number} [offset] - Pagination offset
 * @param {number} [limit] - Pagination limit
 * @returns {Object} Formatted list response
 */
export function formatList(items, count, offset = 0, limit = 100) {
  return formatResponse({
    items,
    count,
    offset,
    limit,
    hasMore: offset + items.length < count
  }, {
    pagination: { offset, limit, total: count }
  });
}

/**
 * Format a paginated response (alternative format)
 * @param {Array} items - The items to return
 * @param {Object} options - Pagination options
 * @returns {Object} Formatted paginated response
 */
export function formatPaginated(items, options = {}) {
  const { count, offset = 0, limit = 100 } = options;
  return formatList(items, count || items.length, offset, limit);
}

/**
 * Format a single item response
 * @param {Object} item - The item to return
 * @param {Object} [meta] - Optional metadata
 * @returns {Object} Formatted item response
 */
export function formatItem(item, meta = {}) {
  return formatResponse({ item }, meta);
}

/**
 * Format a success message response
 * @param {string} message - Success message
 * @param {Object} [data] - Optional additional data
 * @returns {Object} Formatted success response
 */
export function formatSuccess(message, data = {}) {
  return formatResponse({ message, ...data });
}

/**
 * Format a resource created response (201)
 * @param {Object} item - The created resource
 * @param {Object} [meta] - Optional metadata
 * @returns {Object} Formatted created response
 */
export function formatCreated(item, meta = {}) {
  return formatResponse({ item, created: true }, { statusCode: 201, ...meta });
}

/**
 * Format a resource updated response
 * @param {Object} item - The updated resource
 * @param {Object} [meta] - Optional metadata
 * @returns {Object} Formatted updated response
 */
export function formatUpdated(item, meta = {}) {
  return formatResponse({ item, updated: true }, meta);
}

/**
 * Format a resource deleted response
 * @param {string} resourceId - ID of deleted resource
 * @param {string} [resourceType] - Type of resource deleted
 * @returns {Object} Formatted deleted response
 */
export function formatDeleted(resourceId, resourceType = 'resource') {
  return formatResponse({
    deleted: true,
    resourceId,
    resourceType,
    message: `${resourceType} ${resourceId} deleted successfully`
  });
}

/**
 * Format an empty response (no results)
 * @param {Object} [meta] - Optional metadata
 * @returns {Object} Formatted empty response
 */
export function formatEmpty(meta = {}) {
  return formatResponse({ items: [], count: 0 }, meta);
}

/**
 * Format an error response
 * @param {number} httpCode - HTTP status code
 * @param {Error|Object} error - Error object or error details
 * @returns {Object} Formatted error response
 */
export function formatError(httpCode, error) {
  const errorObj = error instanceof Error ? {
    code: error.code || 'INTERNAL_ERROR',
    message: error.message
  } : error;

  return {
    success: false,
    error: errorObj,
    meta: {
      timestamp: new Date().toISOString(),
      statusCode: httpCode
    }
  };
}

export default {
  formatResponse,
  formatList,
  formatPaginated,
  formatItem,
  formatSuccess,
  formatCreated,
  formatUpdated,
  formatDeleted,
  formatEmpty,
  formatError
};
