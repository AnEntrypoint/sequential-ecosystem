/**
 * error-sender.js
 *
 * Send error responses via Express response object
 */

import { buildErrorResponse } from './error-builder.js';

export function sendError(res, code, message, details = {}) {
  const response = buildErrorResponse(code, message, details);
  res.status(response.statusCode).json(response.error);
}
