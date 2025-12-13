/**
 * Operations Section Generator
 * Returns documentation for storage backends, deployment, troubleshooting, and best practices
 *
 * Delegates to:
 * - operations-content: Complete operations documentation
 */

import { OPERATIONS_CONTENT } from './operations-content.js';

export function operationsSection() {
  return OPERATIONS_CONTENT;
}
