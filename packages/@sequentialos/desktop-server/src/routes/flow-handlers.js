import { validateTaskName } from '@sequentialos/core';
import { throwValidationError } from '@sequentialos/error-handling';
import { validateParam, sanitizeInput } from '@sequentialos/validation';
import { asyncHandler } from '../middleware/error-handler.js';
import { formatResponse, formatError } from '@sequentialos/response-formatting';
import { CancellationToken } from './cancellation-token.js';
import { executeFlow } from './flow-executor.js';

export class FlowHandlers {
  constructor(repository, taskRepository, taskService) {
    this.repository = repository;
    this.taskRepository = taskRepository;
    this.taskService = taskService;
    this.flowExecutions = new Map();
  }

  create = asyncHandler(async (req, res) => {
    const { id, name, states } = req.body;
    if (!id || !name) throwValidationError('flowDefinition', 'id and name are required');

    if (typeof id !== 'string') {
      throwValidationError('id', `id must be a string, got ${typeof id}`);
    }

    validateParam(validateTaskName, 'id')(id);

    const sanitizedName = sanitizeInput(name);
    if (typeof sanitizedName !== 'string' || sanitizedName.length === 0) {
      throwValidationError('name', 'name must be a non-empty string');
    }

    if (states && !Array.isArray(states)) throwValidationError('states', 'states must be an array');
    if (states?.length > 0) {
      for (let i = 0; i < states.length; i++) {
        if (!states[i].id || typeof states[i].id !== 'string') {
          throwValidationError('states', `states[${i}].id is required and must be a string`);
        }
        if (!/^[a-zA-Z0-9._-]+$/.test(states[i].id)) {
          throwValidationError('states', `states[${i}].id contains invalid characters`);
        }
      }
    }

    const graph = {
      id,
      initial: states?.find(s => s.type === 'initial')?.id || states?.[0]?.id || 'start',
      states: (states || []).reduce((acc, state) => {
        acc[state.id] = {
          type: state.type === 'final' || state.type === 'parallel' ? state.type : (state.type === 'initial' ? undefined : state.type),
          handlerType: state.handlerType,
          taskName: state.taskName,
          taskInput: state.taskInput,
          timeout: state.timeout || undefined,
          code: state.code,
          onDone: state.onDone || undefined,
          onError: state.onError || undefined,
          condition: state.condition || undefined,
          onTrue: state.onTrue || undefined,
          onFalse: state.onFalse || undefined,
          expression: state.expression || undefined,
          cases: state.cases || undefined,
          default: state.default || undefined,
          branches: state.branches || undefined,
          joinCondition: state.joinCondition || undefined
        };
        Object.keys(acc[state.id]).forEach(key => acc[state.id][key] === undefined && delete acc[state.id][key]);
        return acc;
      }, {})
    };

    await this.repository.save(id, graph, { name: sanitizedName, runner: 'flow', inputs: [] });
    res.json(formatResponse({ success: true, id, message: 'Flow saved' }));
  });

  run = asyncHandler(async (req, res) => {
    const { flow, input } = req.body;
    if (!flow?.states) throwValidationError('flow', 'flow with states is required');

    const executionId = `flow-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const cancellationToken = new CancellationToken(executionId);
    this.flowExecutions.set(executionId, cancellationToken);

    try {
      const result = await executeFlow(flow, input, executionId, cancellationToken, this.taskRepository, this.taskService);

      if (result.cancelled || cancellationToken.isCancelled()) {
        res.json(formatResponse({
          cancelled: true,
          cancelledAt: cancellationToken.cancelledAt,
          cancelledBy: cancellationToken.cancelledBy,
          cancelReason: cancellationToken.cancelReason,
          executedStates: result.executedStates,
          executionLog: result.executionLog,
          duration: result.duration
        }));
      } else if (result.error) {
        res.status(500).json(formatError(500, {
          code: 'FLOW_EXECUTION_FAILED',
          message: result.error,
          duration: result.duration,
          executedStates: result.executedStates,
          executionLog: result.executionLog,
          timedOut: result.timedOut,
          timeoutInfo: result.timeoutInfo
        }));
      } else {
        res.json(formatResponse({
          duration: result.duration,
          finalState: result.finalState,
          executedStates: result.executedStates,
          result: result.result,
          executionLog: result.executionLog,
          timedOut: result.timedOut,
          timeoutInfo: result.timeoutInfo
        }));
      }
    } catch (err) {
      this.flowExecutions.delete(executionId);
      if (err.message.includes('cancelled')) {
        res.json(formatResponse({
          cancelled: true,
          cancelledAt: cancellationToken.cancelledAt,
          cancelledBy: cancellationToken.cancelledBy,
          cancelReason: cancellationToken.cancelReason,
          executedStates: [],
          executionLog: [],
          duration: Date.now() - Date.parse(executionId.split('-')[1])
        }));
      } else {
        res.status(500).json(formatError(500, { code: 'FLOW_EXECUTION_FAILED', message: err.message, executedStates: [], executionLog: [] }));
      }
    } finally {
      this.flowExecutions.delete(executionId);
    }
  });
}
