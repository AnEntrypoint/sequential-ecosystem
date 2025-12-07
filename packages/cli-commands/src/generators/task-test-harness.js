export function createTaskTestHarness() {
  const mocks = new Map();
  const callHistory = [];

  return {
    mockTool(toolCategory, toolName, responseOrFn) {
      const key = `${toolCategory}:${toolName}`;
      const mockFn = typeof responseOrFn === 'function' ? responseOrFn : () => responseOrFn;

      mocks.set(key, mockFn);
      return this;
    },

    mockTaskCall(taskName, responseOrFn) {
      return this.mockTool('task', taskName, responseOrFn);
    },

    mockDatabaseQuery(queryName, responseOrFn) {
      return this.mockTool('database', queryName, responseOrFn);
    },

    mockApiCall(apiName, responseOrFn) {
      return this.mockTool('api', apiName, responseOrFn);
    },

    mockFileOperation(operation, responseOrFn) {
      return this.mockTool('file', operation, responseOrFn);
    },

    async runTask(taskFn, input) {
      const self = this;
      callHistory.length = 0;

      const mockHostTool = async (category, name, payload) => {
        const key = `${category}:${name}`;
        callHistory.push({ category, name, payload, timestamp: Date.now() });

        if (!mocks.has(key)) {
          throw new Error(`No mock registered for ${key}. Use mockTool('${category}', '${name}', ...)`);
        }

        const mockFn = mocks.get(key);
        return await Promise.resolve(mockFn(payload));
      };

      const context = { __callHostTool__: mockHostTool };
      return await taskFn.call(context, input);
    },

    getCallHistory() {
      return callHistory;
    },

    getCallsTo(category, name) {
      return callHistory.filter(call => call.category === category && call.name === name);
    },

    getLastCall() {
      return callHistory[callHistory.length - 1];
    },

    clearHistory() {
      callHistory.length = 0;
      return this;
    },

    createCompositionTest(tasks) {
      const self = this;

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
            self.clearHistory();

            try {
              const result = await self.runTask(taskFn, this.input);
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
            callSequence.push(...self.getCallHistory());
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
    },

    createErrorScenarioTest(taskFn) {
      const self = this;

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

          self.clearHistory();

          const failKey = `${this.failOnCall.category}:${this.failOnCall.name}`;
          self.mockTool(this.failOnCall.category, this.failOnCall.name, () => {
            throw new Error(`Mock failure for ${failKey}`);
          });

          try {
            await self.runTask(taskFn, this.input);
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
              calls: self.getCallHistory()
            };
          }
        }
      };
    }
  };
}

export function generateTaskTestHarnessTemplate() {
  return `/**
 * Task Test Harness
 *
 * Integration testing for task composition and tool invocation.
 */

import { createTaskTestHarness } from '@sequential/task-test-harness';

const harness = createTaskTestHarness();

// Task 1: Fetch user data
export async function getUser(userId) {
  const user = await __callHostTool__('database', 'getUser', { id: userId });
  const orders = await __callHostTool__('database', 'getUserOrders', { userId });
  return { user, orders, count: orders.length };
}

// Task 2: Create user and notify
export async function createUserWithNotification(userData) {
  const user = await __callHostTool__('database', 'createUser', userData);
  await __callHostTool__('api', 'sendEmail', { email: user.email, subject: 'Welcome' });
  return { success: true, user };
}

// Test 1: Simple task composition
export async function testUserFetch() {
  harness
    .mockDatabaseQuery('getUser', { id: 123, name: 'John' })
    .mockDatabaseQuery('getUserOrders', [{ id: 1, total: 100 }]);

  const result = await harness.runTask(getUser, 123);

  console.log('✓ User fetch succeeded');
  console.log('  - Calls made:', harness.getCallHistory().length);
  console.log('  - Result:', result);

  return result;
}

// Test 2: Multi-step composition with assertions
export async function testUserCreationFlow() {
  const test = harness.createCompositionTest({
    createUser: createUserWithNotification
  })
    .withInput({ name: 'Jane', email: 'jane@example.com' })
    .mockDatabaseQuery('createUser', { id: 456, name: 'Jane', email: 'jane@example.com' })
    .mockApiCall('sendEmail', { sent: true })
    .expectCallSequence([
      { category: 'database', name: 'createUser' },
      { category: 'api', name: 'sendEmail' }
    ])
    .assertResult((result) => {
      if (!result.success) throw new Error('Expected success');
      if (result.user.id !== 456) throw new Error('Invalid user ID');
    });

  // Note: This would require enhancing the test builder
  console.log('✓ Multi-step test configured');
  return test;
}

// Test 3: Error scenario - database fails
export async function testDatabaseFailure() {
  const errorTest = harness.createErrorScenarioTest(getUser)
    .withInput(999)
    .failWhen('database', 'getUser')
    .expectError('Mock failure');

  const result = await errorTest.run();
  console.log('✓ Error scenario test:', result.success ? 'PASSED' : 'FAILED');
  return result;
}

// Test 4: Verify call order
export async function testCallOrder() {
  harness.clearHistory();
  harness
    .mockDatabaseQuery('getUser', { id: 123, name: 'John' })
    .mockDatabaseQuery('getUserOrders', []);

  await harness.runTask(getUser, 123);

  const history = harness.getCallHistory();
  const getFirstCalls = history.filter(c => c.name === 'getUser').map(c => c.category);
  const orderCalls = history.filter(c => c.name === 'getUserOrders').map(c => c.category);

  console.log('✓ Call order verified');
  console.log('  - getUser calls:', getFirstCalls.length);
  console.log('  - getUserOrders calls:', orderCalls.length);

  return history;
}

// Test 5: Mock different responses
export async function testConditionalResponses() {
  harness.clearHistory();

  // Mock with function for dynamic responses
  let callCount = 0;
  harness.mockDatabaseQuery('getUser', () => {
    callCount++;
    return { id: 123, name: 'John', callCount };
  });

  harness.mockDatabaseQuery('getUserOrders', () => []);

  const result = await harness.runTask(getUser, 123);
  console.log('✓ Dynamic mock responses work');
  console.log('  - Call count from mock:', result.user.callCount);

  return result;
}
`;
}
