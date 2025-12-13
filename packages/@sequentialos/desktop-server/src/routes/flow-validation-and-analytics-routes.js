/**
 * flow-validation-and-analytics-routes.js
 *
 * Flow validation and analytics metrics endpoints
 */

import { asyncHandler } from '../middleware/error-handler.js';
import { formatResponse, formatError } from '@sequentialos/response-formatting';

export function registerFlowValidationAndAnalyticsRoutes(app, repository, metricsCollector, stateValidator) {
  // Validate flow state transitions
  app.post('/api/flows/:flowId/validate-transitions', asyncHandler(async (req, res) => {
    const { flowId } = req.params;
    const flow = await repository.get(flowId);
    if (!flow) {
      return res.status(404).json(formatError(404, { message: `Flow not found: ${flowId}` }));
    }

    const statesArray = Array.isArray(flow.states) ? flow.states : Object.entries(flow.states).map(([id, state]) => ({ id, ...state }));
    const validation = stateValidator.validateStateTransitions(flow, statesArray);
    const unreachable = stateValidator.detectUnreachableStates(flow, statesArray);

    res.json(formatResponse({
      flowId,
      validation: {
        ...validation,
        unreachable
      }
    }));
  }));

  // Get execution metrics
  app.get('/api/flows/analytics/metrics', asyncHandler(async (req, res) => {
    const metrics = metricsCollector.getExecutionMetrics();
    res.json(formatResponse({ metrics }));
  }));

  // Get metrics snapshot
  app.get('/api/flows/analytics/summary', asyncHandler(async (req, res) => {
    const snapshot = metricsCollector.getSnapshot();
    res.json(formatResponse({ snapshot }));
  }));

  // Get service performance
  app.get('/api/flows/analytics/services', asyncHandler(async (req, res) => {
    const services = metricsCollector.getServicePerformance();
    res.json(formatResponse({ services }));
  }));

  // Get slowest states
  app.get('/api/flows/analytics/slowest', asyncHandler(async (req, res) => {
    const slowestStates = metricsCollector.getSlowestStates();
    res.json(formatResponse({ slowestStates }));
  }));

  // Get percentiles
  app.get('/api/flows/analytics/percentiles', asyncHandler(async (req, res) => {
    const percentiles = metricsCollector.getPercentiles();
    res.json(formatResponse({ percentiles }));
  }));
}
