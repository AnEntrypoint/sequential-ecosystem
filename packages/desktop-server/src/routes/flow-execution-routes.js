/**
 * flow-execution-routes.js
 *
 * Flow execution and cancellation endpoints
 */

import { asyncHandler } from '../middleware/error-handler.js';
import { formatResponse, formatError } from '@sequentialos/response-formatting';
import { DistributedFlowOrchestrator } from './distributed-flows.js';

export function registerFlowExecutionRoutes(app, repository, flowHandlers) {
  // Execute single flow
  app.post('/api/flows/:flowId/execute', asyncHandler(async (req, res) => {
    const { flowId } = req.params;
    const { input } = req.body;
    const flow = await repository.get(flowId);
    if (!flow) {
      return res.status(404).json(formatError(404, { message: `Flow not found: ${flowId}` }));
    }
    const executionId = `flow-${flowId}-${Date.now()}`;
    const { backgroundTaskManager } = require('@sequentialos/server-utilities');
    await backgroundTaskManager.spawn(`flow:${flowId}`, [flow, input], { executionId });
    res.json(formatResponse({ executionId, flowId, status: 'started' }));
  }));

  // Cancel flow execution
  app.post('/api/flows/:executionId/cancel', asyncHandler(async (req, res) => {
    const { executionId } = req.params;
    const { reason } = req.body || {};
    const token = flowHandlers.flowExecutions.get(executionId);
    if (!token) {
      return res.status(404).json(formatError(404, { message: `Flow execution not found: ${executionId}` }));
    }
    const success = token.cancel(reason || 'User requested cancellation', 'api');
    if (success) {
      res.json(formatResponse({ executionId, cancelled: true, cancelReason: token.cancelReason }));
    } else {
      res.json(formatResponse({ executionId, cancelled: false, message: 'Flow already cancelled' }));
    }
  }));

  // Execute distributed flow
  app.post('/api/flows/:flowId/distributed/execute', asyncHandler(async (req, res) => {
    const { flowId } = req.params;
    const { input, services } = req.body;

    const flow = await repository.get(flowId);
    if (!flow) {
      return res.status(404).json(formatError(404, { message: `Flow not found: ${flowId}` }));
    }

    const orchestrator = new DistributedFlowOrchestrator();

    if (services) {
      services.forEach(svc => {
        orchestrator.registerService(svc.name, svc.endpoint, svc.tasks || {});
      });
    }

    const statesArray = Array.isArray(flow.states) ? flow.states : Object.entries(flow.states).map(([id, state]) => ({ id, ...state }));
    const distributedFlow = { states: statesArray };

    const result = await orchestrator.executeDistributedFlow(distributedFlow, input || {});

    res.json(formatResponse({
      flowId,
      executionId: `dist-${Date.now()}`,
      success: result.success,
      duration: result.duration,
      completedStates: result.completedStates,
      result: result.result,
      errors: result.errors,
      executionLog: result.executionLog
    }));
  }));
}
