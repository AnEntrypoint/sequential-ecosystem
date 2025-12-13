/**
 * Task Composition Patterns
 * Retry, fallback, batch, parallel, pipeline, and transform patterns
 *
 * Delegates to:
 * - task-retry-fallback-patterns: Retry and fallback resilience patterns
 * - task-batch-parallel-patterns: Batch and parallel concurrency patterns
 * - task-transform-patterns: Map, filter, conditional, aggregate transformations
 * - task-pipeline-composition: Pipeline and compose chaining patterns
 */

import { createRetryPattern, createFallbackPattern } from './task-retry-fallback-patterns.js';
import { createBatchPattern, createParallelPattern } from './task-batch-parallel-patterns.js';
import { createMapPattern, createFilterPattern, createConditionalPattern, createAggregatePattern } from './task-transform-patterns.js';
import { createPipelinePattern, createComposePattern } from './task-pipeline-composition.js';

export function createTaskPatterns() {
  const retry = createRetryPattern();
  const fallback = createFallbackPattern();
  const batch = createBatchPattern();
  const parallel = createParallelPattern();
  const map = createMapPattern();
  const filter = createFilterPattern();
  const conditional = createConditionalPattern();
  const aggregate = createAggregatePattern();

  return {
    retry: retry.retry.bind(retry),
    fallback: fallback.fallback.bind(fallback),
    batch: batch.batch.bind(batch),
    parallel: parallel.parallel.bind(parallel),
    mapResults: map.mapResults.bind(map),
    filterResults: filter.filterResults.bind(filter),
    conditional: conditional.conditional.bind(conditional),
    aggregate: aggregate.aggregate.bind(aggregate)
  };
}

export function createPipelinePatterns() {
  const pipeline = createPipelinePattern();
  const compose = createComposePattern();

  return {
    pipeline: pipeline.pipeline.bind(pipeline),
    compose: compose.compose.bind(compose)
  };
}
