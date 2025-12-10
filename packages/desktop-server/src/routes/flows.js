import { validateTaskName } from 'core';
import { createValidationError, throwValidationError } from '@sequential/error-handling';
import { validateParam, sanitizeInput } from '@sequential/validation';
import { asyncHandler } from '../middleware/error-handler.js';
import { executeTaskWithTimeout, backgroundTaskManager } from 'server-utilities';
import { formatResponse, formatError } from 'response-formatting';
import { registerCRUDRoutes } from '@sequential/crud-router';
import { createServiceFactory } from '@sequential/service-factory';
import { TimeoutPolicyEngine, handleFlowTimeout, handleStateTimeout } from './timeout-policies.js';
import { DistributedFlowOrchestrator, createDistributedFlowDefinition } from './distributed-flows.js';
import { FlowMetricsCollector } from './flow-analytics.js';
import { FlowStateTransitionValidator, createFlowStateValidator } from './flow-state-transitions.js';

const flowExecutions = new Map();
const metricsCollector = new FlowMetricsCollector();
const stateValidator = createFlowStateValidator();

class FlowAnalyzer {
  constructor(statesArray, initial) {
    this.states = statesArray;
    this.initial = initial;
    this.visited = new Set();
    this.recStack = new Set();
    this.loops = [];
    this.reachable = new Set();
  }

  analyze() {
    const topology = this.detectTopology();
    const loops = this.detectLoops();
    const reachable = this.detectReachability();
    const states = this.mapStates();
    const validity = this.validateConsistency(loops);
    const suggestions = this.generateSuggestions(topology, loops, reachable);

    return { states, topology, analysis: { validity, loops, reachable, unreachable: this.getUnreachable(reachable), suggestions } };
  }

  detectTopology() {
    const chains = [];
    const branches = [];
    const parallel = [];

    this.states.forEach(s => {
      if (s.type === 'parallel') {
        parallel.push({ state: s.id, branches: s.branches || [] });
      } else if (s.type === 'if' || s.type === 'switch') {
        const routes = [];
        if (s.type === 'if') routes.push(s.onTrue, s.onFalse);
        else if (s.cases) routes.push(...Object.values(s.cases), s.default);
        branches.push({ state: s.id, routes: routes.filter(Boolean) });
      } else if (s.onDone) {
        chains.push({ from: s.id, to: s.onDone });
      }
    });

    return { chains, branches, parallel };
  }

  detectLoops() {
    const loops = [];
    this.states.forEach(s => {
      this.visited.clear();
      this.recStack.clear();
      if (this._hasCycle(s.id)) {
        loops.push(this._traceLoop(s.id));
      }
    });
    return loops;
  }

  _hasCycle(stateId) {
    this.visited.add(stateId);
    this.recStack.add(stateId);
    const state = this.states.find(s => s.id === stateId);

    const getNextStates = (s) => {
      const next = [];
      if (s.onDone) next.push(s.onDone);
      if (s.onTrue) next.push(s.onTrue);
      if (s.onFalse) next.push(s.onFalse);
      if (s.cases) next.push(...Object.values(s.cases));
      if (s.default) next.push(s.default);
      if (s.branches) next.push(...s.branches);
      return next;
    };

    for (const nextId of getNextStates(state || {})) {
      if (!this.visited.has(nextId)) {
        if (this._hasCycle(nextId)) return true;
      } else if (this.recStack.has(nextId)) {
        return true;
      }
    }

    this.recStack.delete(stateId);
    return false;
  }

  _traceLoop(startId) {
    const path = [];
    let current = startId;
    const visited = new Set();

    while (current && !visited.has(current)) {
      path.push(current);
      visited.add(current);
      const state = this.states.find(s => s.id === current);
      current = state?.onDone || (state?.onTrue === current ? state?.onFalse : state?.onTrue) || null;
    }

    return current ? path.slice(path.indexOf(current)) : [];
  }

  detectReachability() {
    const reachable = new Set();
    const queue = [this.initial];

    while (queue.length) {
      const stateId = queue.shift();
      if (reachable.has(stateId)) continue;
      reachable.add(stateId);

      const state = this.states.find(s => s.id === stateId);
      if (!state) continue;

      const next = [];
      if (state.onDone) next.push(state.onDone);
      if (state.onTrue) next.push(state.onTrue);
      if (state.onFalse) next.push(state.onFalse);
      if (state.cases) next.push(...Object.values(state.cases));
      if (state.default) next.push(state.default);
      if (state.branches) next.push(...state.branches);

      next.filter(Boolean).forEach(s => !reachable.has(s) && queue.push(s));
    }

    this.reachable = reachable;
    return reachable;
  }

  getUnreachable(reachable) {
    return this.states.filter(s => !reachable.has(s.id) && s.type !== 'final').map(s => s.id);
  }

  mapStates() {
    return this.states.reduce((acc, s) => {
      const inbound = this.states.filter(st => {
        const nexts = [];
        if (st.onDone) nexts.push(st.onDone);
        if (st.onTrue) nexts.push(st.onTrue);
        if (st.onFalse) nexts.push(st.onFalse);
        if (st.cases) nexts.push(...Object.values(st.cases));
        if (st.default) nexts.push(st.default);
        if (st.branches) nexts.push(...st.branches);
        return nexts.includes(s.id);
      }).map(st => st.id);

      const outbound = [];
      if (s.onDone) outbound.push(s.onDone);
      if (s.onTrue) outbound.push(s.onTrue);
      if (s.onFalse) outbound.push(s.onFalse);
      if (s.cases) outbound.push(...Object.values(s.cases));
      if (s.default) outbound.push(s.default);
      if (s.branches) outbound.push(...s.branches);

      acc[s.id] = {
        type: s.type || 'task',
        inbound: inbound.filter(Boolean),
        outbound: outbound.filter(Boolean),
        complexity: s.type === 'parallel' ? s.branches?.length || 0 : (s.cases ? Object.keys(s.cases).length : 1)
      };
      return acc;
    }, {});
  }

  validateConsistency(loops) {
    const issues = [];

    this.states.forEach(s => {
      if ((s.type === 'if' || s.type === 'switch') && !s.onDone && !s.onTrue && !s.onFalse) {
        issues.push(`State ${s.id} has no routing defined`);
      }
      if (s.type === 'parallel' && !s.branches?.length) {
        issues.push(`Parallel state ${s.id} has no branches`);
      }
    });

    if (loops.length > 0) {
      issues.push(`Detected ${loops.length} loop(s): ${loops.map(l => l.join('→')).join('; ')}`);
    }

    return { valid: issues.length === 0, issues };
  }

  generateSuggestions(topology, loops, reachable) {
    const suggestions = [];

    if (loops.length > 0) {
      suggestions.push(`Add loop termination conditions or break states`);
    }

    const unreachable = this.getUnreachable(reachable);
    if (unreachable.length > 0) {
      suggestions.push(`Remove or reconnect unreachable states: ${unreachable.join(', ')}`);
    }

    const branches = topology.branches || [];
    if (branches.length > 3) {
      suggestions.push(`Consider consolidating ${branches.length} branching states`);
    }

    return suggestions;
  }
}

class CancellationToken {
  constructor(executionId) {
    this.executionId = executionId;
    this.cancelled = false;
    this.cancelledAt = null;
    this.cancelReason = null;
    this.cancelledBy = null;
  }

  cancel(reason, source = 'api') {
    if (this.cancelled) return false;
    this.cancelled = true;
    this.cancelledAt = Date.now();
    this.cancelReason = reason;
    this.cancelledBy = source;
    return true;
  }

  isCancelled() {
    return this.cancelled;
  }

  throwIfCancelled() {
    if (this.cancelled) {
      throw new Error(`Flow execution cancelled: ${this.cancelReason}`);
    }
  }
}

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

      const executionId = `flow-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const cancellationToken = new CancellationToken(executionId);
      flowExecutions.set(executionId, cancellationToken);

      const startTime = Date.now();
      const statesArray = Array.isArray(flow.states) ? flow.states : Object.entries(flow.states).map(([id, state]) => ({ id, ...state }));
      let currentState = statesArray.find(s => s.type === 'initial' || s.id === flow.initial);
      if (!currentState) throwValidationError('flow', 'flow must have an initial state');

      const executionLog = [];
      let result = input || {};
      let error = null;
      let cancelled = false;
      const executedStates = [];
      const MAX_ITERATIONS = 1000;
      let iterations = 0;
      const timeoutEngine = new TimeoutPolicyEngine(flow.flowTimeout || 30000);
      let timedOut = false;
      let timeoutInfo = null;

      try {
        while (currentState?.type !== 'final' && iterations < MAX_ITERATIONS) {
          iterations++;
          cancellationToken.throwIfCancelled();

          const flowTimeoutCheck = timeoutEngine.checkFlowTimeout();
          if (flowTimeoutCheck.timedOut) {
            timedOut = true;
            timeoutInfo = { type: 'flow', ...flowTimeoutCheck };
            executionLog.push(`Flow timeout exceeded: ${flowTimeoutCheck.elapsed}ms > ${flowTimeoutCheck.limit}ms`);
            if (flow.onFlowTimeout) {
              const timeoutHandler = statesArray.find(s => s.id === flow.onFlowTimeout);
              if (timeoutHandler) {
                currentState = timeoutHandler;
                continue;
              }
            }
            throw new Error(`Flow execution timeout: ${flowTimeoutCheck.exceeded}ms over limit`);
          }

          executionLog.push(`Executing state: ${currentState.id}`);
          try {
          executedStates.push(currentState.id);
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

          if (currentState.timeout) {
            const stateTimeoutCheck = timeoutEngine.checkStateTimeout(currentState.id, timeoutEngine.getElapsedTime(), currentState.timeout);
            if (stateTimeoutCheck.timedOut) {
              timedOut = true;
              timeoutInfo = { type: 'state', state: currentState.id, ...stateTimeoutCheck };
              executionLog.push(`State timeout exceeded: ${stateTimeoutCheck.elapsed}ms > ${stateTimeoutCheck.limit}ms`);

              if (currentState.onTimeout) {
                const timeoutHandler = statesArray.find(s => s.id === currentState.onTimeout);
                if (timeoutHandler) {
                  executionLog.push(`Routing to timeout handler: ${currentState.onTimeout}`);
                  currentState = timeoutHandler;
                  continue;
                }
              }

              if (currentState.fallbackData !== undefined) {
                result = currentState.fallbackData;
                executionLog.push(`Using fallback data due to timeout`);
              } else {
                throw new Error(`State '${currentState.id}' timeout: ${stateTimeoutCheck.exceeded}ms over limit`);
              }
            }
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
          if (err.message.includes('cancelled')) {
            cancelled = true;
            executionLog.push(`Flow cancelled: ${err.message}`);
            break;
          }
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
      const response = {
        duration,
        finalState: currentState?.id || 'unknown',
        executedStates,
        result,
        executionLog
      };

      if (timedOut && timeoutInfo) {
        response.timedOut = true;
        response.timeoutInfo = timeoutInfo;
      }

      if (cancelled || cancellationToken.isCancelled()) {
        response.cancelled = true;
        response.cancelledAt = cancellationToken.cancelledAt;
        response.cancelledBy = cancellationToken.cancelledBy;
        response.cancelReason = cancellationToken.cancelReason;
        res.json(formatResponse(response));
      } else if (error) {
        res.status(500).json(formatError(500, { code: 'FLOW_EXECUTION_FAILED', message: error, duration, executedStates, executionLog, timedOut, timeoutInfo }));
      } else {
        res.json(formatResponse(response));
      }
      } catch (err) {
        flowExecutions.delete(executionId);
        if (err.message.includes('cancelled')) {
          res.json(formatResponse({
            cancelled: true,
            cancelledAt: cancellationToken.cancelledAt,
            cancelledBy: cancellationToken.cancelledBy,
            cancelReason: cancellationToken.cancelReason,
            executedStates,
            executionLog,
            duration: Date.now() - startTime
          }));
        } else {
          res.status(500).json(formatError(500, { code: 'FLOW_EXECUTION_FAILED', message: err.message, executedStates, executionLog }));
        }
      } finally {
        flowExecutions.delete(executionId);
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

  app.post('/api/flows/:executionId/cancel', asyncHandler(async (req, res) => {
    const { executionId } = req.params;
    const { reason } = req.body || {};
    const token = flowExecutions.get(executionId);
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
