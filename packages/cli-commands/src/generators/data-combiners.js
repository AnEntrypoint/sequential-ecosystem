/**
 * Data Combiners
 * Compose, chain, and combine data transformations
 *
 * Delegates to:
 * - composition-engine: Sequential composition and chaining
 * - result-aggregator: Parallel execution and aggregation
 */

export { compose, chain, pipeline } from './composition-engine.js';
export { parallel, aggregate, combineResults } from './result-aggregator.js';
