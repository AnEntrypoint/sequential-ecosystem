export class DistributedFlowOrchestrator {
  constructor() {
    this.services = new Map();
    this.globalState = {};
    this.executionLog = [];
    this.checkpoints = [];
    this.compensations = [];
  }

  registerService(serviceName, endpoint, tasks = {}) {
    this.services.set(serviceName, { endpoint, tasks, status: 'active' });
  }

  async executeDistributedFlow(flow, input) {
    const startTime = Date.now();
    let currentState = flow.states.find(s => s.type === 'initial');
    let result = input || {};
    const errors = [];
    const completedStates = [];

    while (currentState && currentState.type !== 'final') {
      completedStates.push(currentState.id);
      this.log(`Executing state: ${currentState.id}`);

      try {
        if (currentState.service) {
          result = await this.executeServiceTask(currentState, result);
          if (currentState.compensation) {
            this.compensations.push({ state: currentState.id, compensation: currentState.compensation });
          }
        } else if (currentState.type === 'parallel') {
          result = await this.executeParallelBranches(currentState, result, flow);
        } else if (currentState.type === 'if') {
          const nextStateId = await this.evaluateCondition(currentState, result);
          currentState = flow.states.find(s => s.id === nextStateId);
          continue;
        } else if (currentState.type === 'switch') {
          const nextStateId = await this.evaluateSwitch(currentState, result);
          currentState = flow.states.find(s => s.id === nextStateId);
          continue;
        }

        const nextStateId = currentState.onDone;
        if (!nextStateId) break;
        currentState = flow.states.find(s => s.id === nextStateId);
      } catch (err) {
        errors.push({ state: currentState.id, error: err.message });
        this.log(`Error in state ${currentState.id}: ${err.message}`);

        if (currentState.onError) {
          const errorState = flow.states.find(s => s.id === currentState.onError);
          if (errorState) {
            currentState = errorState;
            continue;
          }
        }

        if (this.compensations.length > 0) {
          await this.executeCompensation(flow);
        }
        break;
      }
    }

    const duration = Date.now() - startTime;
    return {
      success: errors.length === 0,
      duration,
      result,
      completedStates,
      errors,
      executionLog: this.executionLog
    };
  }

  async executeServiceTask(state, input) {
    const service = this.services.get(state.service);
    if (!service) throw new Error(`Service not found: ${state.service}`);
    if (service.status !== 'active') throw new Error(`Service unavailable: ${state.service}`);

    const task = service.tasks[state.taskName];
    if (!task) throw new Error(`Task not found: ${state.taskName}`);

    const result = await task(input, this.globalState);
    this.log(`Service ${state.service} executed: ${state.taskName}`);
    return result;
  }

  async executeParallelBranches(state, input, flow) {
    const branches = state.branches || [];
    const results = await Promise.all(
      branches.map(async (branchId) => {
        const branchState = flow.states.find(s => s.id === branchId);
        if (branchState?.service) {
          return await this.executeServiceTask(branchState, input);
        }
        return input;
      })
    );

    this.log(`Parallel execution completed: ${branches.length} branches`);
    return { branches: results, branchCount: branches.length };
  }

  async evaluateCondition(state, input) {
    const conditionFn = typeof state.condition === 'function' ? state.condition : new Function('input', `return ${state.condition}`);
    const result = await conditionFn(input);
    return result ? state.onTrue : state.onFalse;
  }

  async evaluateSwitch(state, input) {
    const expressionFn = typeof state.expression === 'function' ? state.expression : new Function('input', `return ${state.expression}`);
    const value = await expressionFn(input);
    return state.cases[value] || state.default;
  }

  async executeCompensation(flow) {
    this.log('Executing compensating transactions...');
    for (let i = this.compensations.length - 1; i >= 0; i--) {
      const compensation = this.compensations[i];
      const compensationState = flow.states.find(s => s.id === compensation.compensation);
      if (compensationState?.service) {
        await this.executeServiceTask(compensationState, {});
        this.log(`Compensation executed: ${compensation.compensation}`);
      }
    }
  }

  getGlobalState(key) {
    return this.globalState[key];
  }

  setGlobalState(key, value) {
    this.globalState[key] = value;
    this.log(`Global state updated: ${key}`);
  }

  getServiceStatus(serviceName) {
    const service = this.services.get(serviceName);
    return service ? { name: serviceName, ...service, healthy: service.status === 'active' } : null;
  }

  log(message) {
    const timestamp = new Date().toISOString();
    this.executionLog.push(`[${timestamp}] ${message}`);
  }
}

export async function executeDistributedFlowWithOrchestrator(orchestrator, flow, input) {
  orchestrator.executionLog = [];
  orchestrator.compensations = [];
  return await orchestrator.executeDistributedFlow(flow, input);
}

export function createDistributedFlowDefinition(id, name, states, config = {}) {
  return {
    id,
    name,
    states,
    flowTimeout: config.flowTimeout || 30000,
    retryPolicy: config.retryPolicy || { maxAttempts: 3, backoffMultiplier: 2 },
    compensationEnabled: config.compensationEnabled !== false,
    coordinatorId: config.coordinatorId || 'default'
  };
}
