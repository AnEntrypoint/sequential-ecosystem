/**
 * Flow Documentation Analyzer
 * Creates flow documenters with analysis capabilities
 *
 * Delegates to:
 * - flow-analyzer: Graph analysis (transitions, paths, complexity)
 * - flow-documenter: Flow documentation factory and retrieval
 */

import { createFlowDocumenter } from './flow-documenter.js';

export { createFlowDocumenter };
