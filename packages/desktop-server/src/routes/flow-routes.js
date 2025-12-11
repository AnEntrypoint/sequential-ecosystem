import { asyncHandler } from '../middleware/error-handler.js';
import { formatResponse, formatError } from '@sequentialos/response-formatting';
import { FlowAnalyzer } from './flow-analyzer.js';
import { DistributedFlowOrchestrator } from './distributed-flows.js';

export function registerFlowApiRoutes(app, repository, metricsCollector, stateValidator, flowHandlers) {
  app.get('/api/flows', asyncHandler(async (req, res) => {
    const flows = await repository.getAll();
    res.json(formatResponse({ flows }));
  }));

  app.get('/api/flows/:flowId', asyncHandler(async (req, res) => {
    const { flowId } = req.params;
    const flow = await repository.get(flowId);
    res.json(formatResponse({ flow }));
  }));

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

  app.get('/api/flows/:flowId/history', asyncHandler(async (req, res) => {
    const { flowId } = req.params;
    const history = await repository.getHistory?.(flowId) || [];
    res.json(formatResponse({ flowId, runs: history, count: history.length }));
  }));

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

  app.post('/api/flows/:flowId/analyze', asyncHandler(async (req, res) => {
    const { flowId } = req.params;
    const flow = await repository.get(flowId);
    if (!flow) {
      return res.status(404).json(formatError(404, { message: `Flow not found: ${flowId}` }));
    }

    const statesArray = Array.isArray(flow.states) ? flow.states : Object.entries(flow.states).map(([id, state]) => ({ id, ...state }));
    const initial = flow.initial || statesArray.find(s => s.type === 'initial')?.id || statesArray[0]?.id;

    const analyzer = new FlowAnalyzer(statesArray, initial);
    const analysis = analyzer.analyze();

    res.json(formatResponse({ flowId, analysis }));
  }));

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

  app.get('/api/flows/:flowId/distributed/analysis', asyncHandler(async (req, res) => {
    const { flowId } = req.params;
    const flow = await repository.get(flowId);
    if (!flow) {
      return res.status(404).json(formatError(404, { message: `Flow not found: ${flowId}` }));
    }

    const statesArray = Array.isArray(flow.states) ? flow.states : Object.entries(flow.states).map(([id, state]) => ({ id, ...state }));

    const serviceStates = statesArray.filter(s => s.service);
    const services = [...new Set(serviceStates.map(s => s.service))];
    const parallelStates = statesArray.filter(s => s.type === 'parallel');
    const compensationStates = statesArray.filter(s => s.compensation);

    const analysis = {
      flowId,
      totalStates: statesArray.length,
      services,
      serviceCount: services.length,
      parallelBranches: parallelStates.length,
      compensationRequired: compensationStates.length > 0,
      distributedPattern: serviceStates.length > 1 ? 'multi-service' : 'single-service',
      complexity: {
        hasParallelism: parallelStates.length > 0,
        hasConditionalRouting: statesArray.some(s => s.type === 'if' || s.type === 'switch'),
        hasCompensation: compensationStates.length > 0,
        requiresCoordination: services.length > 1
      }
    };

    res.json(formatResponse({ flowId, analysis }));
  }));

  app.get('/api/flows/analytics/metrics', asyncHandler(async (req, res) => {
    const metrics = metricsCollector.getExecutionMetrics();
    res.json(formatResponse({ metrics }));
  }));

  app.get('/api/flows/analytics/summary', asyncHandler(async (req, res) => {
    const snapshot = metricsCollector.getSnapshot();
    res.json(formatResponse({ snapshot }));
  }));

  app.get('/api/flows/analytics/services', asyncHandler(async (req, res) => {
    const services = metricsCollector.getServicePerformance();
    res.json(formatResponse({ services }));
  }));

  app.get('/api/flows/analytics/slowest', asyncHandler(async (req, res) => {
    const slowestStates = metricsCollector.getSlowestStates();
    res.json(formatResponse({ slowestStates }));
  }));

  app.get('/api/flows/analytics/percentiles', asyncHandler(async (req, res) => {
    const percentiles = metricsCollector.getPercentiles();
    res.json(formatResponse({ percentiles }));
  }));

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

  app.post('/api/flows', flowHandlers.create);
  app.post('/api/flows/run', flowHandlers.run);
}
