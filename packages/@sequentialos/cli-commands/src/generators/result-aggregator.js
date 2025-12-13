/**
 * Result Aggregator
 * Parallel execution and result aggregation
 */

import { DataResult, wrapResult } from './data-result.js';

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
