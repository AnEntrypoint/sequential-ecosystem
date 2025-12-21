/**
 * Create a lock for sequential execution
 *
 * @returns {Function} Lock acquire function
 */
export function createLock() {
  let locked = false;
  const queue = [];

  return async function acquire(fn) {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        locked = true;
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          locked = false;
          const next = queue.shift();
          if (next) {
            next();
          }
        }
      };

      if (!locked) {
        execute();
      } else {
        queue.push(execute);
      }
    });
  };
}
