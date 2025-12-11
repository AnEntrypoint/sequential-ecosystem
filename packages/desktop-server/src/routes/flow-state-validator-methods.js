export function validateStateTransitions(flow, statesArray, validator) {
  const validation = {
    valid: true,
    issues: [],
    warnings: [],
    loops: [],
    unreachable: [],
    timeoutIssues: [],
    compensationIssues: []
  };

  statesArray.forEach(state => {
    validateState(state, statesArray, validation);
  });

  detectLoops(flow, statesArray, validation);
  detectTimeoutRaces(statesArray, validation);
  detectCompensationIssues(statesArray, validation);
  validateParallelJoins(statesArray, validation);

  validation.valid = validation.issues.length === 0;
  return validation;
}

function validateState(state, statesArray, validation) {
  const stateMap = new Map(statesArray.map(s => [s.id, s]));

  if (state.onDone && !stateMap.has(state.onDone)) {
    validation.issues.push(`State '${state.id}': onDone target '${state.onDone}' does not exist`);
  }

  if (state.onError && !stateMap.has(state.onError)) {
    validation.issues.push(`State '${state.id}': onError target '${state.onError}' does not exist`);
  }

  if (state.onTimeout && !stateMap.has(state.onTimeout)) {
    validation.warnings.push(`State '${state.id}': onTimeout target '${state.onTimeout}' does not exist`);
  }

  if (state.type === 'if') {
    if (!stateMap.has(state.onTrue)) {
      validation.issues.push(`If state '${state.id}': onTrue target '${state.onTrue}' does not exist`);
    }
    if (!stateMap.has(state.onFalse)) {
      validation.issues.push(`If state '${state.id}': onFalse target '${state.onFalse}' does not exist`);
    }
  }

  if (state.type === 'switch' && state.cases) {
    Object.entries(state.cases).forEach(([key, target]) => {
      if (!stateMap.has(target)) {
        validation.issues.push(`Switch state '${state.id}': case '${key}' target '${target}' does not exist`);
      }
    });
    if (state.default && !stateMap.has(state.default)) {
      validation.issues.push(`Switch state '${state.id}': default target '${state.default}' does not exist`);
    }
  }

  if (state.type === 'parallel' && state.branches) {
    state.branches.forEach(branchId => {
      if (!stateMap.has(branchId)) {
        validation.issues.push(`Parallel state '${state.id}': branch '${branchId}' does not exist`);
      }
    });

    if (!['all', 'any', 'all-or-error'].includes(state.joinCondition)) {
      validation.warnings.push(`Parallel state '${state.id}': unknown joinCondition '${state.joinCondition}'`);
    }
  }

  if (state.timeout && state.timeout < 100) {
    validation.warnings.push(`State '${state.id}': timeout ${state.timeout}ms may be too short`);
  }
}

function detectLoops(flow, statesArray, validation) {
  const stateMap = new Map(statesArray.map(s => [s.id, s]));
  const visited = new Set();
  const recStack = new Set();

  const dfs = (stateId, path = []) => {
    if (recStack.has(stateId)) {
      const loopStart = path.indexOf(stateId);
      const loop = path.slice(loopStart).concat(stateId);
      validation.loops.push(loop.join(' → '));
      return true;
    }

    if (visited.has(stateId)) return false;

    visited.add(stateId);
    recStack.add(stateId);

    const state = stateMap.get(stateId);
    if (!state) {
      recStack.delete(stateId);
      return false;
    }

    const nextStates = [];
    if (state.onDone) nextStates.push(state.onDone);
    if (state.onError) nextStates.push(state.onError);
    if (state.onTimeout) nextStates.push(state.onTimeout);

    if (state.type === 'if') {
      if (state.onTrue) nextStates.push(state.onTrue);
      if (state.onFalse) nextStates.push(state.onFalse);
    }

    if (state.type === 'switch' && state.cases) {
      Object.values(state.cases).forEach(t => nextStates.push(t));
      if (state.default) nextStates.push(state.default);
    }

    for (const nextId of nextStates) {
      if (dfs(nextId, path.concat(stateId))) {
        return true;
      }
    }

    recStack.delete(stateId);
    return false;
  };

  dfs(flow.initial);

  if (validation.loops.length > 0) {
    validation.issues.push(`Flow contains ${validation.loops.length} loop(s): ${validation.loops.join('; ')}`);
  }
}

function detectTimeoutRaces(statesArray, validation) {
  statesArray.forEach(state => {
    if (state.timeout && !state.onTimeout) {
      validation.timeoutIssues.push(`State '${state.id}': has timeout but no onTimeout handler - will escalate to flow level`);
    }

    if (state.type === 'parallel' && state.timeout) {
      const branches = state.branches || [];
      const branchWithoutTimeout = branches.length > 0;
      if (branchWithoutTimeout) {
        validation.warnings.push(`Parallel state '${state.id}': timeout on parallel may not cover all branches`);
      }
    }
  });
}

function detectCompensationIssues(statesArray, validation) {
  const transactionStates = statesArray.filter(s => s.compensation);

  if (transactionStates.length > 0) {
    const stateMap = new Map(statesArray.map(s => [s.id, s]));

    transactionStates.forEach(state => {
      const compensationTarget = stateMap.get(state.compensation);
      if (!compensationTarget) {
        validation.compensationIssues.push(`State '${state.id}': compensation target '${state.compensation}' does not exist`);
      }
    });

    if (validation.compensationIssues.length === 0) {
      validation.warnings.push(`Flow uses Saga pattern with ${transactionStates.length} compensable states`);
    }
  }
}

function validateParallelJoins(statesArray, validation) {
  statesArray.filter(s => s.type === 'parallel').forEach(pstate => {
    const joinCondition = pstate.joinCondition || 'all';

    if (joinCondition === 'any' && pstate.branches && pstate.branches.length > 1) {
      validation.warnings.push(`Parallel state '${pstate.id}': joinCondition "any" may cause remaining branches to be orphaned`);
    }

    if (joinCondition === 'all-or-error') {
      if (!pstate.onError) {
        validation.warnings.push(`Parallel state '${pstate.id}': joinCondition "all-or-error" used but no onError handler`);
      }
    }
  });
}

export function detectUnreachableStates(flow, statesArray) {
  const stateMap = new Map(statesArray.map(s => [s.id, s]));
  const reachable = new Set();
  const queue = [flow.initial];

  while (queue.length > 0) {
    const stateId = queue.shift();
    if (reachable.has(stateId)) continue;

    reachable.add(stateId);
    const state = stateMap.get(stateId);

    if (!state || state.type === 'final') continue;

    const nextStates = [];
    if (state.onDone) nextStates.push(state.onDone);
    if (state.onError) nextStates.push(state.onError);
    if (state.onTimeout) nextStates.push(state.onTimeout);

    if (state.type === 'if') {
      if (state.onTrue) nextStates.push(state.onTrue);
      if (state.onFalse) nextStates.push(state.onFalse);
    }

    if (state.type === 'switch' && state.cases) {
      Object.values(state.cases).forEach(t => nextStates.push(t));
      if (state.default) nextStates.push(state.default);
    }

    if (state.type === 'parallel' && state.branches) {
      nextStates.push(...state.branches);
    }

    nextStates.forEach(s => {
      if (!reachable.has(s)) queue.push(s);
    });
  }

  const unreachable = statesArray
    .filter(s => s.type !== 'initial' && !reachable.has(s.id))
    .map(s => s.id);

  return unreachable;
}
