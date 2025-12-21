/**
 * Process items in batches
 *
 * @param {Array} items - Items to process
 * @param {Function} fn - Async function to apply to each item
 * @param {number} batchSize - Size of each batch (default: 10)
 * @returns {Promise<Array>} Results of all items
 */
export async function batchProcess(items, fn, batchSize = 10) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((item, idx) => fn(item, i + idx)));
    results.push(...batchResults);
  }
  return results;
}
