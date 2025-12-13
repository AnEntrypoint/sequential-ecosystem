export function validateState(state, statesArray, validation) {
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
