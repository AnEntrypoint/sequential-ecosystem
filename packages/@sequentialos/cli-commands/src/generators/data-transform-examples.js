/**
 * Data Transform Examples
 * Template content for data transformation utilities
 */

export const DATA_TRANSFORM_TEMPLATE = `/**
 * Data Transformation Utilities
 *
 * Chainable result types and data pipeline utilities.
 */

import { DataResult, pipeline, compose, chain } from '@sequentialos/data-transform';

// Task that returns complex result
export async function fetchUserWithOrders(userId) {
  const user = await __callHostTool__('database', 'getUser', { id: userId });
  const orders = await __callHostTool__('database', 'getUserOrders', { userId });
  return { success: true, data: { user, orders }, timestamp: new Date().toISOString() };
}

// Simple extraction
export async function extractUser(userId) {
  const result = await fetchUserWithOrders(userId);
  const extracted = DataResult.ok(result)
    .extract('data.user')
    .getOrThrow();
  return extracted;
}

// Multi-step transformation
export async function processUserData(userId) {
  const result = await fetchUserWithOrders(userId);

  const processed = DataResult.ok(result)
    .extract('data')
    .map(data => ({
      userId: data.user.id,
      userName: data.user.name,
      orderCount: data.orders.length,
      totalSpent: data.orders.reduce((sum, o) => sum + o.amount, 0)
    }))
    .getOrThrow();

  return processed;
}

// Selective field extraction
export async function getUserSummary(userId) {
  const result = await fetchUserWithOrders(userId);

  const summary = DataResult.ok(result)
    .extract('data.user')
    .select(['id', 'name', 'email'])
    .getOrThrow();

  return summary;
}

// Filter results
export async function getActiveUsers(userIds) {
  const users = await Promise.all(
    userIds.map(id => __callHostTool__('database', 'getUser', { id }))
  );

  const active = users
    .map(user => DataResult.ok(user).filter(u => u.active, 'User is inactive'))
    .filter(r => r.isOk())
    .map(r => r.value);

  return active;
}

// Pipeline composition
export async function complexDataFlow(userId) {
  const result = await fetchUserWithOrders(userId);

  const final = pipeline(
    result,
    (data) => DataResult.ok(data.data),
    (data) => DataResult.ok({
      user: data.user,
      orderCount: data.orders.length,
      isPremium: data.orders.length > 10
    }),
    (data) => DataResult.ok({ ...data, processed: true })
  );

  return final.getOrThrow();
}

// Chain operations
export async function chainedTransform(userId) {
  const result = await fetchUserWithOrders(userId);

  const final = chain(
    result,
    (data) => DataResult.ok(data.data),
    (data) => DataResult.ok(data.user),
    (user) => DataResult.ok({ id: user.id, name: user.name })
  );

  return final.getOrThrow();
}

// With error handling
export async function safeTransform(userId) {
  const result = await fetchUserWithOrders(userId);

  const final = DataResult.ok(result)
    .extract('data')
    .filter(d => d.orders.length > 0, 'No orders found')
    .map(d => ({ user: d.user.name, orderCount: d.orders.length }))
    .getOrElse({ user: 'Unknown', orderCount: 0 });

  return final;
}
`;
