import { createFlowSimulator } from './flow-test-kit-simulator.js';
import { createFlowTestBuilder } from './flow-test-kit-builder.js';
import { generateErrorScenarios, analyzeFlowCoverage, profileFlowPerformance, generateFlowTestKitTemplate } from './flow-test-kit-analysis.js';

export function createFlowTestKit() {
  return {
    createFlowSimulator,
    createFlowTestBuilder,
    generateErrorScenarios,
    analyzeFlowCoverage,
    profileFlowPerformance
  };
}

export { generateFlowTestKitTemplate };
