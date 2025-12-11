/**
 * tools.js - Facade for tool routes
 *
 * Delegates to focused modules:
 * - tool-rate-limiter: Rate limiting for test endpoint
 * - tool-query-routes: Tool retrieval and search
 * - tool-management-routes: Tool creation/deletion
 * - tool-validation-routes: Tool testing and import validation
 * - tool-execution-routes: Tool invocation from apps
 */

import { createToolTestRateLimiter } from './tool-rate-limiter.js';
import { registerToolQueryRoutes } from './tool-query-routes.js';
import { registerToolManagementRoutes } from './tool-management-routes.js';
import { registerToolValidationRoutes } from './tool-validation-routes.js';
import { registerToolExecutionRoutes } from './tool-execution-routes.js';

export function registerToolRoutes(app, container) {
  const registry = container.resolve('ToolRegistry');
  const rateLimiter = createToolTestRateLimiter();

  // Register all tool route groups
  registerToolQueryRoutes(app, registry);
  registerToolManagementRoutes(app, registry);
  registerToolValidationRoutes(app, rateLimiter);
  registerToolExecutionRoutes(app, registry);
}
