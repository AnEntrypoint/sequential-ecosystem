/**
 * Flow Composition Core
 * Creates flow graph structures for composed workflows
 *
 * Delegates to:
 * - flow-composition-builder: Composition graph creation
 * - flow-composition-templates: JSX code generation
 * - flow-composition-validator: Structure validation
 * - flow-composition-analyzer: Composition analysis
 */

import { composeFlows } from './flow-composition-builder.js';
import { generateComposedFlowTemplate } from './flow-composition-templates.js';
import { validateFlowComposition } from './flow-composition-validator.js';
import { analyzeFlowComposition } from './flow-composition-analyzer.js';

export { composeFlows, generateComposedFlowTemplate, validateFlowComposition, analyzeFlowComposition };
