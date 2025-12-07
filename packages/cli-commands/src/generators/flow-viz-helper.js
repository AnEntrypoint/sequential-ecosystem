export function visualizeFlowState(graph, currentState = null, executionPath = []) {
  if (!graph || !graph.states) {
    return 'Invalid flow graph';
  }

  const stateNames = Object.keys(graph.states);
  const lines = [];

  lines.push('=== Flow State Diagram ===');
  lines.push(`Initial: ${graph.initial}`);
  lines.push('');

  for (const stateName of stateNames) {
    const state = graph.states[stateName];
    const isInitial = stateName === graph.initial;
    const isCurrent = stateName === currentState;
    const isVisited = executionPath.includes(stateName);

    let marker = '';
    if (isCurrent) marker = '→ ';
    else if (isInitial) marker = '◎ ';
    else if (isVisited) marker = '✓ ';
    else marker = '  ';

    let stateStr = `${marker}${stateName}`;

    if (state.type === 'final') {
      stateStr += ' [FINAL]';
    } else if (state.handlerType) {
      stateStr += ` [${state.handlerType}]`;
    }

    lines.push(stateStr);

    if (state.onDone) {
      lines.push(`  ├─ onDone → ${state.onDone}`);
    }
    if (state.onError) {
      lines.push(`  └─ onError → ${state.onError}`);
    }
  }

  if (executionPath.length > 0) {
    lines.push('');
    lines.push(`Execution Path: ${executionPath.join(' → ')}`);
  }

  return lines.join('\n');
}

export function analyzeFlowStructure(graph) {
  if (!graph || !graph.states) {
    return { valid: false, error: 'Invalid graph' };
  }

  const analysis = {
    totalStates: Object.keys(graph.states).length,
    finalStates: [],
    parallelStates: [],
    taskStates: [],
    codeStates: [],
    handlerlessTasks: [],
    deadEnds: [],
    complexity: 0
  };

  const stateNames = Object.keys(graph.states);

  for (const stateName of stateNames) {
    const state = graph.states[stateName];

    if (state.type === 'final') {
      analysis.finalStates.push(stateName);
    }
    if (state.type === 'parallel') {
      analysis.parallelStates.push(stateName);
    }
    if (state.handlerType === 'task') {
      analysis.taskStates.push(stateName);
    }
    if (state.handlerType === 'code') {
      analysis.codeStates.push(stateName);
    }
    if (!state.onDone && !state.onError && state.type !== 'final') {
      analysis.deadEnds.push(stateName);
    }
    if (!state.handlerType && !state.taskName && !state.code && state.type !== 'final') {
      analysis.handlerlessTasks.push(stateName);
    }

    // Simple complexity metric
    analysis.complexity += (state.onDone ? 1 : 0) + (state.onError ? 1 : 0);
  }

  return {
    valid: true,
    analysis,
    warnings: [
      analysis.deadEnds.length > 0 ? `Dead ends: ${analysis.deadEnds.join(', ')}` : null,
      analysis.handlerlessTasks.length > 0 ? `No handlers: ${analysis.handlerlessTasks.join(', ')}` : null,
      analysis.finalStates.length === 0 ? 'No final states defined' : null,
      analysis.complexity > 20 ? `High complexity (${analysis.complexity}): Consider splitting` : null
    ].filter(Boolean)
  };
}

export function generateFlowStateTransitions(graph) {
  if (!graph || !graph.states) {
    return [];
  }

  const transitions = [];

  for (const [stateName, state] of Object.entries(graph.states)) {
    if (state.onDone) {
      transitions.push({
        from: stateName,
        to: state.onDone,
        trigger: 'onDone',
        condition: 'success'
      });
    }
    if (state.onError) {
      transitions.push({
        from: stateName,
        to: state.onError,
        trigger: 'onError',
        condition: 'error'
      });
    }
  }

  return transitions;
}
