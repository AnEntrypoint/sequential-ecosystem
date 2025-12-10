export function generateTaskDecoratorTemplate() {
  return `/**
 * Task Decorators
 *
 * Composable task middleware for error recovery, performance tracking, and validation.
 */

import { createTaskDecorator } from '@sequentialos/task-decorators';

const decorator = createTaskDecorator();

// Single decorator
export const fetchUserTask = decorator.withErrorRecovery({ maxRetries: 3 })(
  async (userId) => {
    const response = await fetch(\\\`/api/users/\\\${userId}\\\`);
    return response.json();
  }
);

// Multiple decorators composed
export const processOrderTask = decorator.compose(
  decorator.withErrorRecovery({ maxRetries: 5 }),
  decorator.withPerformanceTracking(),
  decorator.withTimeout(30000),
  decorator.withLogging({ prefix: 'processOrder' })
)(
  async (orderId) => {
    const order = await __callHostTool__('database', 'getOrder', { orderId });
    return { success: true, order };
  }
);

// Input validation
export const createUserTask = decorator.withInputValidation({
  type: 'object',
  properties: {
    name: { type: 'string', required: true, minLength: 3 },
    email: { type: 'string', required: true },
    age: { type: 'number', minimum: 18 }
  }
})(
  async (input) => {
    return await __callHostTool__('database', 'createUser', input);
  }
);

// Caching for expensive operations
export const expensiveQueryTask = decorator.withCaching({ ttl: 300000 })(
  async (query) => {
    const result = await __callHostTool__('database', 'complexQuery', { query });
    return result;
  }
);
`;
}
