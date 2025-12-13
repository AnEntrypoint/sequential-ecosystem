/**
 * error-builder.js
 *
 * Core error response builder with timestamp support
 */

import { getStatusCode } from './error-codes.js';
import { nowISO } from '@sequentialos/timestamp-utilities';

export function buildErrorResponse(code, message, details = {}) {
  const statusCode = getStatusCode(code);

  const error = {
    code,
    message,
    timestamp: nowISO()
  };

  if (Object.keys(details).length > 0) {
    error.details = details;
  }

  if (process.env.DEBUG) {
    error.debug = details;
  }

  return {
    error,
    statusCode
  };
}
