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

export function generateFlowTestKitTemplate() {
  return `/**
 * Flow Test Kit
 *
 * Simulate, test, and debug flows with breakpoints and state inspection.
 */

import { createFlowTestKit } from '@sequential/flow-test-kit';

export const graph = {
  initial: 'fetchData',
  states: {
    fetchData: { onDone: 'validateData', onError: 'handleFetchError' },
    validateData: { onDone: 'processData', onError: 'handleValidationError' },
    processData: { onDone: 'final', onError: 'handleProcessError' },
    handleFetchError: { onDone: 'final' },
    handleValidationError: { onDone: 'final' },
    handleProcessError: { onDone: 'final' },
    final: { type: 'final' }
  }
};

const testKit = createFlowTestKit();

// Test 1: Happy path
export async function testHappyPath() {
  const test = testKit.createFlowTestBuilder(graph)
    .givenInput({ userId: 123 })
    .whenEntering('fetchData', async (input) => {
      return { user: { id: 123, name: 'John' } };
    })
    .whenEntering('validateData', async (input) => {
      return { ...input, validated: true };
    })
    .whenEntering('processData', async (input) => {
      return { ...input, processed: true };
    })
    .expectState('processData')
    .expectContext({ validated: true, processed: true });

  const result = await test.run();
  console.log('Happy path test:', result.success ? 'PASSED' : 'FAILED');
  return result;
}

// Test 2: Error scenario
export async function testErrorHandling() {
  const test = testKit.createFlowTestBuilder(graph)
    .givenInput({ userId: 999 })
    .whenEntering('fetchData', async (input) => {
      throw new Error('User not found');
    })
    .whenEntering('handleFetchError', async (input) => {
      return { error: 'User not found', recovered: true };
    })
    .expectState('handleFetchError')
    .expectError();

  const result = await test.run();
  console.log('Error handling test:', result.success ? 'PASSED' : 'FAILED');
  return result;
}

// Test 3: With breakpoint debugging
export async function testWithBreakpoint() {
  const simulator = testKit.createFlowSimulator(graph)
    .onState('fetchData', async (input) => ({ user: { id: 123 } }))
    .onState('validateData', async (input) => ({ ...input, validated: true }))
    .setBreakpoint('validateData');

  const paused = await simulator.execute({ userId: 123 });
  console.log('Paused at state:', paused.currentState);
  console.log('Current context:', paused.context);
  console.log('Execution path:', paused.executionPath);

  return paused;
}

// Test 4: Generate error scenarios
export function getErrorScenarios() {
  return testKit.generateErrorScenarios(graph);
}

// Test 5: Measure flow performance
export async function profileFlow() {
  const simulator = testKit.createFlowSimulator(graph)
    .onState('fetchData', async (input) => {
      await new Promise(r => setTimeout(r, 100));
      return { user: { id: 123 } };
    })
    .onState('validateData', async (input) => {
      await new Promise(r => setTimeout(r, 50));
      return { ...input, validated: true };
    })
    .onState('processData', async (input) => {
      await new Promise(r => setTimeout(r, 200));
      return { ...input, processed: true };
    });

  const result = await simulator.execute({ userId: 123 });
  const profile = testKit.profileFlowPerformance(result);
  console.log('Flow performance:', profile);
  return profile;
}
`;
}
