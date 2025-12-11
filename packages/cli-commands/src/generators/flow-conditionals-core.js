import { createConditionalState, createSwitchState } from './conditional-builders.js';
import { executeConditional, executeSwitch } from './conditional-executors.js';
import { validateConditionalFlow } from './conditional-validator.js';
import { analyzeConditionalFlow } from './conditional-analyzer.js';
import { generateConditionalFlowTemplate } from './conditional-template.js';

/**
 * flow-conditionals-core.js - Facade for conditional flow operations
 *
 * Delegates to focused modules:
 * - conditional-builders: State definition creation
 * - conditional-executors: Condition and selector execution
 * - conditional-validator: Flow validation
 * - conditional-analyzer: Flow structure analysis
 * - conditional-template: Template generation
 */

export {
  createConditionalState,
  createSwitchState,
  executeConditional,
  executeSwitch,
  validateConditionalFlow,
  analyzeConditionalFlow,
  generateConditionalFlowTemplate
};
