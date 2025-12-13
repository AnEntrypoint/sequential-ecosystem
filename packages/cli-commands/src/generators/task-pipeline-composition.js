/**
 * Task Pipeline & Composition Patterns
 * Sequential chaining and function composition patterns
 */

export function createPipelinePattern() {
  return {
    pipeline(taskFns) {
      return async function pipelineTask(initialInput) {
        let result = initialInput;

        for (const taskFn of taskFns) {
          result = await taskFn(result);
        }

        return result;
      };
    }
  };
}

export function createComposePattern() {
  return {
    compose(...taskFns) {
      return async function composedTask(input) {
        return taskFns.reduce((result, taskFn) =>
          Promise.resolve(result).then(taskFn),
          Promise.resolve(input)
        );
      };
    }
  };
}
