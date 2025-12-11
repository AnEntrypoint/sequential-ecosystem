/**
 * flow-analysis-routes.js
 *
 * Flow analysis and distributed analysis endpoints
 */

import { asyncHandler } from '../middleware/error-handler.js';
import { formatResponse, formatError } from '@sequentialos/response-formatting';
import { FlowAnalyzer } from './flow-analyzer.js';

export function registerFlowAnalysisRoutes(app, repository) {
  // Analyze flow
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

  // Analyze distributed flow
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
}
