/**
 * flow-routes.js - Flow API Routes Facade
 *
 * Delegates to focused route modules:
 * - flow-crud-routes: List, get, create, run flows
 * - flow-execution-routes: Execute and cancel flows
 * - flow-analysis-routes: Analyze flows (single and distributed)
 * - flow-validation-and-analytics-routes: Validation and metrics endpoints
 */

import { registerFlowCrudRoutes } from './flow-crud-routes.js';
import { registerFlowExecutionRoutes } from './flow-execution-routes.js';
import { registerFlowAnalysisRoutes } from './flow-analysis-routes.js';
import { registerFlowValidationAndAnalyticsRoutes } from './flow-validation-and-analytics-routes.js';

export function registerFlowApiRoutes(app, repository, metricsCollector, stateValidator, flowHandlers) {
  registerFlowCrudRoutes(app, repository, flowHandlers);
  registerFlowExecutionRoutes(app, repository, flowHandlers);
  registerFlowAnalysisRoutes(app, repository);
  registerFlowValidationAndAnalyticsRoutes(app, repository, metricsCollector, stateValidator);
}
