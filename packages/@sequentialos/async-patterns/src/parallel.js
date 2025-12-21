/**
 * Execute tasks in parallel
 *
 * @param {Array<Promise>} tasks - Array of promises to execute
 * @returns {Promise<Array>} Results of all tasks
 */
export async function parallel(tasks) {
  return Promise.all(tasks);
}

/**
 * Execute tasks sequentially
 *
 * @param {Array<Function>} tasks - Array of async functions to execute
 * @returns {Promise<Array>} Results of all tasks
 */
export async function sequence(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}
