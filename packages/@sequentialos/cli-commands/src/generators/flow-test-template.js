/**
 * Flow Test Template
 * Delegates to:
 * - flow-test-generator: Template generation with parameterized flow name
 */

import { generateFlowTestContent } from './flow-test-generator.js';

export function generateFlowTestTemplate(flowName) {
  return generateFlowTestContent(flowName);
}
