/**
 * Task Transform Patterns
 * Data transformation and filtering patterns
 */

export function createMapPattern() {
  return {
    mapResults(taskFn, mapFn) {
      return async function mappedTask(...args) {
        const result = await taskFn(...args);
        return await mapFn(result);
      };
    }
  };
}

export function createFilterPattern() {
  return {
    filterResults(taskFn, filterFn) {
      return async function filteredTask(items) {
        const results = await taskFn(items);
        return results.filter(filterFn);
      };
    }
  };
}

export function createConditionalPattern() {
  return {
    conditional(condition, trueFn, falseFn) {
      return async function conditionalTask(input) {
        const result = await condition(input);
        return result ? await trueFn(input) : await falseFn(input);
      };
    }
  };
}

export function createAggregatePattern() {
  return {
    aggregate(taskFns, aggregateFn) {
      return async function aggregateTask(input) {
        const results = await Promise.all(taskFns.map(fn => fn(input)));
        return aggregateFn(results);
      };
    }
  };
}
