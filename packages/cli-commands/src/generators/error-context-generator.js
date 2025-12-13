/**
 * Error Context Generator
 * Generates error handlers and context with formatting
 *
 * Delegates to:
 * - error-formatter: Error formatting and stack trace parsing
 * - error-handler-factory: Error handler creation
 * - error-handler-template: Error handler code generation
 */

import { formatErrorWithContext, parseStackTrace } from './error-formatter.js';
import { createErrorHandler } from './error-handler-factory.js';
import { generateErrorHandler } from './error-handler-template.js';

export { formatErrorWithContext, parseStackTrace, createErrorHandler, generateErrorHandler };
