export function createCompositionTestBuilder(harness) {
  return function buildCompositionTest(tasks) {
    return {
      input: null,
      expectedCalls: [],
      assertions: [],

      withInput(data) {
        this.input = data;
        return this;
      },

      expectCall(category, name, payloadMatcher) {
        this.expectedCalls.push({ category, name, payloadMatcher });
        return this;
      },

      expectCallSequence(sequence) {
        sequence.forEach(({ category, name, payloadMatcher }) => {
          this.expectCall(category, name, payloadMatcher);
        });
        return this;
      },

      assertResult(fn) {
        this.assertions.push(fn);
        return this;
      },

      async run() {
        if (!this.input) {
          throw new Error('Input required: use .withInput()');
        }

        const results = [];

        for (const [taskName, taskFn] of Object.entries(tasks)) {
          harness.clearHistory();

          try {
            const result = await harness.runTask(taskFn, this.input);
            results.push({ task: taskName, success: true, result });

            for (const assertion of this.assertions) {
              assertion(result);
            }
          } catch (error) {
            results.push({ task: taskName, success: false, error });
          }
        }

        const callSequence = [];
        for (const [taskName, _] of Object.entries(tasks)) {
          callSequence.push(...harness.getCallHistory());
        }

        const callMatches = this.expectedCalls.every((expected, idx) => {
          const actual = callSequence[idx];
          if (!actual) return false;

          if (actual.category !== expected.category || actual.name !== expected.name) {
            return false;
          }

          if (expected.payloadMatcher) {
            return this.matchPayload(actual.payload, expected.payloadMatcher);
          }

          return true;
        });

        return {
          success: results.every(r => r.success) && callMatches,
          results,
          calls: callSequence,
          expectedCalls: this.expectedCalls
        };
      },

      matchPayload(actual, expected) {
        if (typeof expected === 'function') {
          return expected(actual);
        }

        if (typeof expected === 'object') {
          for (const [key, value] of Object.entries(expected)) {
            if (typeof value === 'function') {
              if (!value(actual[key])) return false;
            } else if (actual[key] !== value) {
              return false;
            }
          }
          return true;
        }

        return actual === expected;
      }
    };
  };
}
