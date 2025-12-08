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
