/**
 * Flow Analysis
 * Analyzes flow coverage, performance, and error scenarios
 */

export function generateErrorScenarios(graph) {
  const scenarios = [];

  for (const [stateName, state] of Object.entries(graph.states || {})) {
    if (state.onError) {
      scenarios.push({
        description: `Error handling in ${stateName}`,
        state: stateName,
        shouldThrow: true,
        expectedNextState: state.onError
      });
    }
  }

  return scenarios;
}

export function analyzeFlowCoverage(graph, executedPaths) {
  const allStates = Object.keys(graph.states || {});
  const executedStates = new Set();

  executedPaths.forEach(path => {
    path.forEach(state => executedStates.add(state));
  });

  const uncoveredStates = allStates.filter(s => !executedStates.has(s));
  const coverage = (executedStates.size / allStates.length) * 100;

  return {
    totalStates: allStates.length,
    coveredStates: executedStates.size,
    uncoveredStates,
    coverage: Math.round(coverage),
    paths: executedPaths.length
  };
}

export function profileFlowPerformance(executionResults) {
  const stateDurations = {};
  let totalDuration = 0;

  executionResults.results?.forEach(({ state, result }) => {
    const duration = result?.duration || 0;
    stateDurations[state] = (stateDurations[state] || 0) + duration;
    totalDuration += duration;
  });

  const slowStates = Object.entries(stateDurations)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return {
    totalDuration,
    stateDurations,
    slowStates: slowStates.map(([state, duration]) => ({
      state,
      duration,
      percentage: ((duration / totalDuration) * 100).toFixed(2)
    }))
  };
}
