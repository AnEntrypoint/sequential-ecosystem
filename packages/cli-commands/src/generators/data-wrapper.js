import { wrapResult } from './data-result.js';

/**
 * data-wrapper.js
 *
 * Decorator for wrapping functions with transformations
 */

export function createDataTransform(transformFn) {
  return (taskFn) => {
    return async function wrappedWithTransform(...args) {
      const result = await taskFn(...args);
      const wrapped = wrapResult(result);
      return wrapped.flatMap(transformFn).getOrThrow();
    };
  };
}
