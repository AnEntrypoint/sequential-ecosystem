/**
 * Flow Visualizer
 * Visualizes flow state diagrams
 */

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
