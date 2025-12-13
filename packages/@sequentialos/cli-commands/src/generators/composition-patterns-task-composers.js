/**
 * Task Composition Patterns
 * Creates task composition patterns (retry, fallback, batch, parallel, pipeline)
 *
 * Delegates to:
 * - task-composition-patterns: All task composition pattern implementations
 */

import { createTaskPatterns, createPipelinePatterns } from './task-composition-patterns.js';

export function createCompositionPatterns() {
  const patterns = createTaskPatterns();
  const pipelinePatterns = createPipelinePatterns();

  return {
    ...patterns,
    ...pipelinePatterns
  };
}
