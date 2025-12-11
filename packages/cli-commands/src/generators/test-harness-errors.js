export function createErrorScenarioTestBuilder(harness) {
  return function buildErrorTest(taskFn) {
    return {
      input: null,
      failOnCall: null,
      expectedError: null,

      withInput(data) {
        this.input = data;
        return this;
      },

      failWhen(category, name) {
        this.failOnCall = { category, name };
        return this;
      },

      expectError(messageOrMatcher) {
        this.expectedError = messageOrMatcher;
        return this;
      },

      async run() {
        if (!this.input) {
          throw new Error('Input required: use .withInput()');
        }

        if (!this.failOnCall) {
          throw new Error('Failure point required: use .failWhen()');
        }

        harness.clearHistory();

        const failKey = `${this.failOnCall.category}:${this.failOnCall.name}`;
        harness.mockTool(this.failOnCall.category, this.failOnCall.name, () => {
          throw new Error(`Mock failure for ${failKey}`);
        });

        try {
          await harness.runTask(taskFn, this.input);
          return {
            success: false,
            error: 'Expected task to throw but it succeeded'
          };
        } catch (error) {
          const matches = this.expectedError
            ? typeof this.expectedError === 'function'
              ? this.expectedError(error)
              : error.message.includes(this.expectedError)
            : true;

          return {
            success: matches,
            error: error.message,
            calls: harness.getCallHistory()
          };
        }
      }
    };
  };
}
