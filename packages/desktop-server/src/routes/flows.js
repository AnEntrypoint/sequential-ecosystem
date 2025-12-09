import { validateTaskName } from '@sequential/core';
import { createValidationError, throwValidationError } from '@sequential/error-handling';
import { validateParam, sanitizeInput } from '@sequential/param-validation';
import { asyncHandler } from '../middleware/error-handler.js';
import { executeTaskWithTimeout, backgroundTaskManager } from '@sequential/server-utilities';
import { formatResponse, formatError } from '@sequential/response-formatting';
import { registerCRUDRoutes } from '@sequential/crud-router';
import { createServiceFactory } from '@sequential/service-factory';

export function registerFlowRoutes(app, container) {
  const { getFlowRepository, getTaskRepository, getTaskService } = createServiceFactory(container);
  const repository = getFlowRepository();
  const taskRepository = getTaskRepository();
  const taskService = getTaskService();

  const flowHandlers = {
    create: asyncHandler(async (req, res) => {
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

      await repository.save(id, graph, { name: sanitizedName, runner: 'flow', inputs: [] });
      res.json(formatResponse({ success: true, id, message: 'Flow saved' }));
    }),

    run: asyncHandler(async (req, res) => {
      const { flow, input } = req.body;
      if (!flow?.states) throwValidationError('flow', 'flow with states is required');

      const startTime = Date.now();
      const statesArray = Array.isArray(flow.states) ? flow.states : Object.entries(flow.states).map(([id, state]) => ({ id, ...state }));
      let currentState = statesArray.find(s => s.type === 'initial' || s.id === flow.initial);
      if (!currentState) throwValidationError('flow', 'flow must have an initial state');

      const executionLog = [];
      let result = input || {};
      let error = null;
      const MAX_ITERATIONS = 1000;
      let iterations = 0;

      while (currentState?.type !== 'final' && iterations < MAX_ITERATIONS) {
        iterations++;
        executionLog.push(`Executing state: ${currentState.id}`);
        try {
          if (currentState.type === 'if') {
            let conditionResult = false;
            try {
              if (currentState.condition) {
                const conditionFn = typeof currentState.condition === 'string'
                  ? new Function('input', `return ${currentState.condition}`)
                  : currentState.condition;
                conditionResult = await conditionFn(result);
              }
            } catch (err) {
              executionLog.push(`Condition evaluation error: ${err.message}`);
              conditionResult = false;
            }
            const nextStateId = conditionResult ? currentState.onTrue : currentState.onFalse;
            executionLog.push(`If condition evaluated to: ${conditionResult}, routing to ${nextStateId}`);
            if (!nextStateId) {
              throw new Error(`No routing defined for if-state ${currentState.id}`);
            }
            const nextState = statesArray.find(s => s.id === nextStateId);
            if (!nextState) {
              throw new Error(`State '${nextStateId}' not found in flow`);
            }
            currentState = nextState;
          } else if (currentState.type === 'switch') {
            let switchValue = result;
            try {
              if (currentState.expression) {
                const exprFn = typeof currentState.expression === 'string'
                  ? new Function('input', `return ${currentState.expression}`)
                  : currentState.expression;
                switchValue = await exprFn(result);
              }
            } catch (err) {
              executionLog.push(`Switch expression error: ${err.message}`);
              switchValue = 'error';
            }
            const nextStateId = currentState.cases?.[switchValue] || currentState.default;
            executionLog.push(`Switch expression evaluated to: ${switchValue}, routing to ${nextStateId}`);
            if (!nextStateId) {
              throw new Error(`No case or default defined for switch-state ${currentState.id}`);
            }
            const nextState = statesArray.find(s => s.id === nextStateId);
            if (!nextState) {
              throw new Error(`State '${nextStateId}' not found in flow`);
            }
            currentState = nextState;
          } else if (currentState.type === 'parallel') {
            const branchIds = currentState.branches || [];
            if (branchIds.length === 0) {
              throw new Error(`Parallel state ${currentState.id} has no branches defined`);
            }
            const branchStates = branchIds.map(bid => statesArray.find(s => s.id === bid)).filter(Boolean);
            if (branchStates.length !== branchIds.length) {
              throw new Error(`One or more branch states not found in parallel state ${currentState.id}`);
            }
            executionLog.push(`Executing ${branchIds.length} parallel branches: ${branchIds.join(', ')}`);

            const branchResults = [];
            const branchErrors = [];
            const executeParallelBranch = async (branchState, branchIndex) => {
              try {
                let branchResult = result;
                let branchCurrent = branchState;
                let branchIterations = 0;

                while (branchCurrent && branchCurrent.type !== 'final' && branchIterations < 100) {
                  branchIterations++;
                  if (branchCurrent.handlerType === 'task' && branchCurrent.taskName) {
                    const task = await taskRepository.get(branchCurrent.taskName);
                    if (!task) throw new Error(`Task not found: ${branchCurrent.taskName}`);
                    const runId = taskService.createRunId();
                    let taskInput = {};
                    if (branchCurrent.taskInput) {
                      try {
                        taskInput = JSON.parse(branchCurrent.taskInput);
                      } catch {
                        throw new Error(`Invalid JSON in taskInput: ${branchCurrent.taskInput}`);
                      }
                    }
                    branchResult = await taskService.executeTask(runId, branchCurrent.taskName, task.code, taskInput);
                  } else if (branchCurrent.code) {
                    branchResult = await executeTaskWithTimeout(branchCurrent.id, branchCurrent.code, branchResult, 30000);
                  }

                  const nextStateId = branchCurrent.onDone;
                  if (!nextStateId) break;
                  branchCurrent = statesArray.find(s => s.id === nextStateId);
                }

                return { index: branchIndex, result: branchResult, error: null, completed: true };
              } catch (err) {
                return { index: branchIndex, result: null, error: err.message, completed: false };
              }
            };

            const parallelPromises = branchStates.map((bs, idx) => executeParallelBranch(bs, idx));
            const outcomes = await Promise.all(parallelPromises);

            outcomes.forEach(outcome => {
              if (outcome.completed) {
                branchResults[outcome.index] = outcome.result;
              } else {
                branchErrors.push({ branch: branchIds[outcome.index], error: outcome.error });
              }
            });

            const joinCondition = currentState.joinCondition || 'all';
            let joinMet = false;

            if (joinCondition === 'all') {
              joinMet = branchErrors.length === 0;
              if (!joinMet) {
                throw new Error(`Parallel join condition 'all' failed: ${branchErrors.map(e => `${e.branch}: ${e.error}`).join('; ')}`);
              }
            } else if (joinCondition === 'any') {
              joinMet = branchResults.length > 0;
              if (!joinMet) {
                throw new Error(`Parallel join condition 'any' failed: all branches failed`);
              }
            } else if (joinCondition === 'all-or-error') {
              joinMet = true;
            }

            result = {
              branches: branchResults,
              errors: branchErrors,
              joinCondition,
              branchCount: branchIds.length,
              successCount: branchResults.length,
              errorCount: branchErrors.length
            };

            executionLog.push(`Parallel execution completed: ${branchResults.length}/${branchIds.length} branches succeeded (join: ${joinCondition})`);

            const nextStateId = currentState.onDone;
            if (!nextStateId) {
              executionLog.push(`No onDone state defined for parallel ${currentState.id}, ending execution`);
              break;
            }
            const nextState = statesArray.find(s => s.id === nextStateId);
            if (!nextState) {
              throw new Error(`State '${nextStateId}' not found in flow`);
            }
            currentState = nextState;
          } else if (currentState.handlerType === 'background-task' && currentState.taskName) {
            const { id: bgTaskId } = backgroundTaskManager.spawn(currentState.taskName, [], {});
            const timeout = currentState.timeout || 30000;
            const bgResult = await Promise.race([
              backgroundTaskManager.waitFor(bgTaskId),
              new Promise((_, reject) => setTimeout(() => reject(new Error(`Background task timeout after ${timeout}ms`)), timeout))
            ]);
            result = { taskId: bgTaskId, status: bgResult.status, duration: bgResult.duration };
            if (bgResult.status !== 'completed') throw new Error(`Background task failed: ${bgResult.error || bgResult.status}`);
            executionLog.push(`Background task completed: ${bgTaskId}`);
          } else if (currentState.handlerType === 'task' && currentState.taskName) {
            const task = await taskRepository.get(currentState.taskName);
            if (!task) throw new Error(`Task not found: ${currentState.taskName}`);
            const runId = taskService.createRunId();
            let taskInput = {};
            if (currentState.taskInput) {
              try {
                taskInput = JSON.parse(currentState.taskInput);
              } catch {
                throw new Error(`Invalid JSON in taskInput: ${currentState.taskInput}`);
              }
            }
            result = await taskService.executeTask(runId, currentState.taskName, task.code, taskInput);
            executionLog.push(`Task output: ${JSON.stringify(result)}`);
          } else if (currentState.code) {
            result = await executeTaskWithTimeout(currentState.id, currentState.code, result, 30000);
            executionLog.push(`Code output: ${JSON.stringify(result)}`);
          }
          const nextStateId = currentState.onDone;
          if (!nextStateId) {
            executionLog.push(`No onDone state defined for ${currentState.id}, ending execution`);
            break;
          }
          const nextState = statesArray.find(s => s.id === nextStateId);
          if (!nextState) {
            throw new Error(`State '${nextStateId}' not found in flow`);
          }
          currentState = nextState;
        } catch (err) {
          error = err.message;
          executionLog.push(`Error: ${err.message}`);
          const fallbackStateId = currentState.onError;
          if (fallbackStateId) {
            const fallbackState = statesArray.find(s => s.id === fallbackStateId);
            if (fallbackState) {
              currentState = fallbackState;
              error = null;
            } else {
              throw new Error(`Error handler state '${fallbackStateId}' not found in flow`);
            }
          } else {
            break;
          }
        }
      }

      if (iterations >= MAX_ITERATIONS) {
        error = `Flow execution exceeded maximum iterations (${MAX_ITERATIONS})`;
        executionLog.push(error);
      }

      const duration = Date.now() - startTime;
      if (error) {
        res.status(500).json(formatError(500, { code: 'FLOW_EXECUTION_FAILED', message: error, duration, executionLog }));
      } else {
        res.json(formatResponse({ duration, finalState: currentState?.id || 'unknown', result, executionLog }));
      }
    })
  };

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
    await backgroundTaskManager.spawn(`flow:${flowId}`, [flow, input], { executionId });
    res.json(formatResponse({ executionId, flowId, status: 'started' }));
  }));

  app.get('/api/flows/:flowId/history', asyncHandler(async (req, res) => {
    const { flowId } = req.params;
    const history = await repository.getHistory?.(flowId) || [];
    res.json(formatResponse({ flowId, runs: history, count: history.length }));
  }));

  app.post('/api/flows', flowHandlers.create);
  app.post('/api/flows/run', flowHandlers.run);
}
