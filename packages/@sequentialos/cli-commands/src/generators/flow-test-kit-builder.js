import { createFlowSimulator } from './flow-test-kit-simulator.js';

export function createFlowTestBuilder(graph) {
  return {
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
}
