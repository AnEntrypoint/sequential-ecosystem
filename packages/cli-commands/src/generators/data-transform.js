export class DataResult {
  constructor(value, error = null) {
    this.value = value;
    this.error = error;
    this.isError = error !== null;
  }

  static ok(value) {
    return new DataResult(value);
  }

  static err(error) {
    return new DataResult(null, error);
  }

  isOk() {
    return !this.isError;
  }

  map(fn) {
    if (this.isError) return this;
    try {
      return DataResult.ok(fn(this.value));
    } catch (error) {
      return DataResult.err(error);
    }
  }

  flatMap(fn) {
    if (this.isError) return this;
    try {
      const result = fn(this.value);
      return result instanceof DataResult ? result : DataResult.ok(result);
    } catch (error) {
      return DataResult.err(error);
    }
  }

  filter(predicate, errorMsg = 'Filter condition not met') {
    if (this.isError) return this;
    if (predicate(this.value)) return this;
    return DataResult.err(new Error(errorMsg));
  }

  extract(path) {
    if (this.isError) return this;
    return this.map(value => extractPath(value, path));
  }

  extractMultiple(paths) {
    if (this.isError) return this;
    return this.map(value => {
      const result = {};
      for (const path of paths) {
        result[path] = extractPath(value, path);
      }
      return result;
    });
  }

  select(fields) {
    if (this.isError) return this;
    return this.map(value => {
      const result = {};
      for (const field of fields) {
        if (field in value) {
          result[field] = value[field];
        }
      }
      return result;
    });
  }

  reject(fields) {
    if (this.isError) return this;
    return this.map(value => {
      const result = { ...value };
      for (const field of fields) {
        delete result[field];
      }
      return result;
    });
  }

  transform(fn) {
    return this.flatMap(fn);
  }

  getOrThrow() {
    if (this.isError) throw this.error;
    return this.value;
  }

  getOrElse(defaultValue) {
    if (this.isError) return defaultValue;
    return this.value;
  }

  unwrap() {
    return { value: this.value, error: this.error, isError: this.isError };
  }
}

export function wrapResult(value) {
  if (value instanceof DataResult) return value;
  return DataResult.ok(value);
}

export function wrapError(error) {
  return DataResult.err(error);
}

export function compose(...transforms) {
  return (value) => {
    let result = DataResult.ok(value);
    for (const transform of transforms) {
      result = result.flatMap(transform);
    }
    return result;
  };
}

export function chain(result, ...transforms) {
  let output = wrapResult(result);
  for (const transform of transforms) {
    output = output.flatMap(transform);
  }
  return output;
}

export function pipeline(value, ...transforms) {
  return compose(...transforms)(value);
}

export function parallel(value, transforms) {
  const results = {};
  for (const [name, transform] of Object.entries(transforms)) {
    results[name] = wrapResult(value).flatMap(transform).unwrap();
  }
  return results;
}

export function aggregate(results, aggregateFn) {
  const values = [];
  for (const result of results) {
    if (!result.isError) {
      values.push(result.value);
    }
  }
  return DataResult.ok(aggregateFn(values));
}

export function combineResults(results, strategy = 'all') {
  const values = [];
  const errors = [];

  for (const result of results) {
    if (result.isError) {
      errors.push(result.error);
    } else {
      values.push(result.value);
    }
  }

  if (strategy === 'all' && errors.length > 0) {
    return DataResult.err(new Error(`${errors.length} errors: ${errors.map(e => e.message).join(', ')}`));
  }

  if (strategy === 'any' && values.length === 0) {
    return DataResult.err(new Error(`All results failed: ${errors.map(e => e.message).join(', ')}`));
  }

  return DataResult.ok(values);
}

export function createDataTransform(transformFn) {
  return (taskFn) => {
    return async function wrappedWithTransform(...args) {
      const result = await taskFn(...args);
      const wrapped = wrapResult(result);
      return wrapped.flatMap(transformFn).getOrThrow();
    };
  };
}

function extractPath(obj, path) {
  if (!path || path === '') return obj;

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return null;

    const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      current = current[key]?.[parseInt(index)];
    } else {
      current = current[part];
    }
  }

  return current;
}

export function generateDataTransformTemplate() {
  return `/**
 * Data Transformation Utilities
 *
 * Chainable result types and data pipeline utilities.
 */

import { DataResult, pipeline, compose, chain } from '@sequential/data-transform';

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
}
