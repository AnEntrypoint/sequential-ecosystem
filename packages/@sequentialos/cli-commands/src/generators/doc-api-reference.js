/**
 * API Reference Section Generator
 * Returns documentation for REST, WebSocket, and CLI APIs
 *
 * Delegates to:
 * - api-reference-content: Content for API, CLI, and examples sections
 */

import { API_REFERENCE_CONTENT } from './api-reference-content.js';

export function apiReferenceSection() {
  return API_REFERENCE_CONTENT;
}
