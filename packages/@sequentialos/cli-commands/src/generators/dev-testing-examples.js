/**
 * Development Testing Examples
 * Template content for development testing framework
 */

export const DEV_TESTING_TEMPLATE = `/**
 * Development Testing Framework
 *
 * Test tasks/flows/tools locally with mocks and fixtures.
 */

import { createMockToolRegistry, createServiceInterceptor, createFixtureLoader, createTestEnvironment } from '@sequentialos/dev-testing';

const testEnv = createTestEnvironment();

// Mock fixture data
testEnv.fixtures
  .load('user:123', { id: 123, name: 'John', email: 'john@example.com' })
  .load('orders:123', [{ id: 1, total: 100 }, { id: 2, total: 200 }]);

// Test 1: Run task with mocks
export async function testFetchUserWithMocks() {
  async function fetchUser(userId) {
    const user = await this.__callHostTool__('database', 'getUser', { id: userId });
    const orders = await this.__callHostTool__('database', 'getUserOrders', { userId });
    return { user, orders };
  }

  const result = await testEnv.runTaskWithMocks(
    fetchUser,
    123,
    {
      'database:getUser': testEnv.fixtures.get('user:123'),
      'database:getUserOrders': testEnv.fixtures.get('orders:123')
    }
  );

  console.log('✓ Test passed, user fetched:', result.user.name);
  return result;
}

// Test 2: Use mock tool registry directly
export async function testWithRegistry() {
  testEnv.mockTools
    .stub('database', 'getUser', { id: 123, name: 'Jane' })
    .stub('api', 'sendEmail', { sent: true });

  const user = await testEnv.mockTools.call('database', 'getUser', { id: 123 });
  const email = await testEnv.mockTools.call('api', 'sendEmail', { to: 'jane@example.com' });

  console.log('✓ Mocks work:', user.name, 'email sent:', email.sent);
  return { user, email };
}

// Test 3: Intercept HTTP calls
export async function testWithInterceptor() {
  async function fetchData() {
    const response = await fetch('https://api.example.com/users/123');
    return await response.json();
  }

  const result = await testEnv.runWithInterceptor(
    fetchData,
    null,
    (interceptor) => {
      interceptor.mockFetch(/api\\.example\\.com/, {
        status: 200,
        body: { id: 123, name: 'Test User' }
      });
    }
  );

  console.log('✓ HTTP intercepted:', result.name);
  return result;
}

// Test 4: Environment-aware configuration
export async function testWithEnvironment() {
  const testProfile = {
    database: 'sqlite://:memory:',
    apiBaseUrl: 'http://localhost:3000',
    enableMocks: true
  };

  console.log('✓ Using test environment:', testProfile);
  return testProfile;
}

// Test 5: Fluent test builder
export async function fluentTestExample() {
  const test = testEnv.createTest('User Fetch Test', async () => {
    const result = await testEnv.runTaskWithMocks(
      async function (userId) {
        return await this.__callHostTool__('database', 'getUser', { id: userId });
      },
      123,
      { 'database:getUser': { id: 123, name: 'Test' } }
    );

    if (!result || !result.name) {
      throw new Error('User name missing');
    }
  });

  const result = await test.run();
  console.log('✓ Test result:', result.passed ? 'PASSED' : 'FAILED');
  return result;
}

// Test 6: Multiple assertions
export async function testWithAssertions() {
  async function processData(input) {
    const data = await this.__callHostTool__('api', 'fetch', { id: input });
    return { processed: true, data };
  }

  const result = await testEnv.runTaskWithMocks(
    processData,
    123,
    { 'api:fetch': { id: 123, value: 'test' } }
  );

  // Assertions
  if (!result.processed) throw new Error('Data not processed');
  if (!result.data) throw new Error('Data missing');
  if (result.data.id !== 123) throw new Error('Wrong ID');

  console.log('✓ All assertions passed');
  return result;
}
`;
