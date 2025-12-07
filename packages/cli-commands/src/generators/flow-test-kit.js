export function createFlowTestKit() {
  return {
    createFlowSimulator(graph) {
      const simulator = {
        handlers: {},
        breakpoints: new Set(),
        executionPath: [],
        stateSnapshots: new Map(),

        onState(stateName, handler) {
          this.handlers[stateName] = handler;
          return this;
        },

        setBreakpoint(stateName) {
          this.breakpoints.add(stateName);
          return this;
        },

        removeBreakpoint(stateName) {
          this.breakpoints.delete(stateName);
          return this;
        },

        async execute(input) {
          let currentState = graph.initial;
          let context = input;
          const results = [];

          while (currentState && graph.states[currentState].type !== 'final') {
            this.executionPath.push(currentState);
            this.stateSnapshots.set(currentState, JSON.parse(JSON.stringify(context)));

            if (this.breakpoints.has(currentState)) {
              return {
                paused: true,
                currentState,
                context,
                executionPath: this.executionPath,
                snapshot: this.stateSnapshots.get(currentState)
              };
            }

            const handler = this.handlers[currentState];
            if (!handler) {
              throw new Error(`No handler for state: ${currentState}`);
            }

            const result = await Promise.resolve(handler(context));
            results.push({ state: currentState, result });

            if (result && result.nextState) {
              currentState = result.nextState;
              context = result.context || context;
            } else if (result && typeof result === 'object' && !Array.isArray(result)) {
              context = result;

              const state = graph.states[currentState];
              if (result.error && state.onError) {
                currentState = state.onError;
              } else if (state.onDone) {
                currentState = state.onDone;
              } else {
                break;
              }
            } else {
              break;
            }
          }

          return {
            paused: false,
            completed: true,
            finalState: currentState,
            context,
            results,
            executionPath: this.executionPath,
            snapshots: Array.from(this.stateSnapshots.entries())
          };
        },

        resume() {
          const lastState = this.executionPath[this.executionPath.length - 1];
          const snapshot = this.stateSnapshots.get(lastState);
          return this.execute(snapshot);
        },

        getExecutionPath() {
          return this.executionPath;
        },

        getSnapshot(stateName) {
          return this.stateSnapshots.get(stateName);
        }
      };

      return simulator;
    },

    createFlowTestBuilder(graph) {
      const builder = {
        input: null,
        expectedStates: [],
        expectedContext: null,
        errorExpected: false,
        handlers: {},
        breakpoints: new Set(),

        givenInput(data) {
          this.input = data;
          return this;
        },

        expectState(stateName) {
          this.expectedStates.push(stateName);
          return this;
        },

        expectContext(contextObject) {
          this.expectedContext = contextObject;
          return this;
        },

        expectError() {
          this.errorExpected = true;
          return this;
        },

        whenEntering(stateName, handler) {
          this.handlers[stateName] = handler;
          return this;
        },

        pause(stateName) {
          this.breakpoints.add(stateName);
          return this;
        },

        async run() {
          if (!this.input) {
            throw new Error('Input required: use .givenInput()');
          }

          const simulator = createFlowSimulator(graph);
          Object.entries(this.handlers).forEach(([state, handler]) => {
            simulator.onState(state, handler);
          });

          this.breakpoints.forEach(state => simulator.setBreakpoint(state));

          try {
            const result = await simulator.execute(this.input);

            if (this.errorExpected) {
              throw new Error('Expected error but execution succeeded');
            }

            const testResults = [];

            if (this.expectedStates.length > 0) {
              const stateMatches = this.expectedStates.every(s => result.executionPath.includes(s));
              testResults.push({
                type: 'states',
                passed: stateMatches,
                expected: this.expectedStates,
                actual: result.executionPath
              });
            }

            if (this.expectedContext) {
              const contextMatches = this.contextMatches(result.context, this.expectedContext);
              testResults.push({
                type: 'context',
                passed: contextMatches,
                expected: this.expectedContext,
                actual: result.context
              });
            }

            return {
              success: testResults.every(r => r.passed),
              results: testResults,
              execution: result
            };
          } catch (error) {
            if (this.errorExpected) {
              return {
                success: true,
                results: [{ type: 'error', passed: true, error: error.message }],
                error
              };
            }

            throw error;
          }
        },

        contextMatches(actual, expected) {
          for (const [key, value] of Object.entries(expected)) {
            if (actual[key] !== value) return false;
          }
          return true;
        }
      };

      return builder;
    },

    generateErrorScenarios(graph) {
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
    },

    analyzeFlowCoverage(graph, executedPaths) {
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
    },

    profileFlowPerformance(executionResults) {
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
