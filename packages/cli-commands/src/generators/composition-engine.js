/**
 * Composition Engine
 * Sequential composition and chaining of transformations
 */

import { DataResult, wrapResult } from './data-result.js';

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
