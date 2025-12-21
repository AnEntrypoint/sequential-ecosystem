/**
 * @module response-formatting
 * Standardized response formatting utilities for Sequential OS API endpoints
 * All responses follow the {success: boolean, data: {...}} wrapper pattern
 */

/**
 * Creates a standardized error response
 * @param {string} code - Error code (e.g., 'VALIDATION_ERROR', 'NOT_FOUND')
 * @param {string} message - Human-readable error message
 * @param {object} details - Additional error details (optional)
 * @returns {object} Formatted error response
 */
export function createErrorResponse(code, message, details = {}) {
  return {
    success: false,
    error: {
      code,
      message,
      ...details
    }
  };
}

/**
 * Creates a standardized success response
 * @param {*} data - Response data
 * @param {object} metadata - Additional metadata (optional)
 * @returns {object} Formatted success response
 */
export function createSuccessResponse(data, metadata = {}) {
  const response = {
    success: true,
    data
  };

  // Only add metadata if it has properties
  if (metadata && Object.keys(metadata).length > 0) {
    response.metadata = metadata;
  }

  return response;
}

/**
 * Creates a paginated response with metadata
 * @param {Array} data - Array of items for current page
 * @param {number} total - Total number of items across all pages
 * @param {number} page - Current page number (1-indexed)
 * @param {number} pageSize - Number of items per page
 * @returns {object} Formatted paginated response
 */
export function createPaginatedResponse(data, total, page, pageSize) {
  const totalPages = Math.ceil(total / pageSize);

  return {
    success: true,
    data,
    metadata: {
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    }
  };
}

/**
 * Creates a metrics response with aggregated data
 * @param {object} metrics - Metrics data object
 * @returns {object} Formatted metrics response
 */
export function createMetricsResponse(metrics) {
  return {
    success: true,
    data: {
      metrics,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Creates a list response with optional metadata
 * @param {Array} items - Array of items
 * @param {object} metadata - Additional metadata (count, filters, etc.)
 * @returns {object} Formatted list response
 */
export function createListResponse(items, metadata = {}) {
  const response = {
    success: true,
    data: {
      items,
      count: items.length
    }
  };

  // Add additional metadata if provided
  if (metadata && Object.keys(metadata).length > 0) {
    response.metadata = metadata;
  }

  return response;
}

/**
 * Creates a batch operation response
 * @param {Array} results - Array of batch operation results
 * @returns {object} Formatted batch response
 */
export function createBatchResponse(results) {
  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    success: failed === 0,
    data: {
      results,
      summary: {
        total: results.length,
        succeeded,
        failed
      }
    }
  };
}

/**
 * Formats an Error object for API response (without stack trace)
 * @param {Error} error - Error object
 * @returns {object} Formatted error object
 */
export function formatErrorForResponse(error) {
  // Never include stack traces in responses (security)
  const formatted = {
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message || 'An unknown error occurred'
  };

  // Include additional details if present (from AppError)
  if (error.details && Object.keys(error.details).length > 0) {
    formatted.details = error.details;
  }

  // Include statusCode for HTTP error mapping
  if (error.statusCode) {
    formatted.statusCode = error.statusCode;
  }

  return formatted;
}

/**
 * Generic response formatter - wraps data in success response
 * @param {*} data - Data to format
 * @returns {object} Formatted response
 */
export function formatResponse(data) {
  // If already formatted, return as-is
  if (data && typeof data === 'object' && 'success' in data) {
    return data;
  }

  return createSuccessResponse(data);
}

/**
 * Generic error formatter - converts Error to error response
 * @param {Error} error - Error to format
 * @returns {object} Formatted error response
 */
export function formatError(error) {
  const formattedError = formatErrorForResponse(error);

  return {
    success: false,
    error: formattedError
  };
}

/**
 * Express middleware to automatically format responses
 * Usage: app.use(responseFormatterMiddleware);
 * Then use: res.success(data) or res.error(error)
 */
export function responseFormatterMiddleware(req, res, next) {
  // Add success helper
  res.success = function(data, metadata = {}) {
    const response = createSuccessResponse(data, metadata);
    return this.json(response);
  };

  // Add error helper
  res.error = function(error, statusCode = null) {
    const response = formatError(error);
    const code = statusCode || error.statusCode || 500;
    return this.status(code).json(response);
  };

  // Add paginated helper
  res.paginated = function(data, total, page, pageSize) {
    const response = createPaginatedResponse(data, total, page, pageSize);
    return this.json(response);
  };

  next();
}
