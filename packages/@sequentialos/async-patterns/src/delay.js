/**
 * Delay execution for specified time
 *
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise} Resolves after delay
 */
export async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
