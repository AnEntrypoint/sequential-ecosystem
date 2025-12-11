import { createTestHarnessMocks } from './test-harness-mocks.js';
import { createCompositionTestBuilder } from './test-harness-composition.js';
import { createErrorScenarioTestBuilder } from './test-harness-errors.js';

export function createTaskTestHarness() {
  const harness = createTestHarnessMocks();
  const compositionBuilder = createCompositionTestBuilder(harness);
  const errorBuilder = createErrorScenarioTestBuilder(harness);

  return {
    mockTool: harness.mockTool.bind(harness),
    mockTaskCall: harness.mockTaskCall.bind(harness),
    mockDatabaseQuery: harness.mockDatabaseQuery.bind(harness),
    mockApiCall: harness.mockApiCall.bind(harness),
    mockFileOperation: harness.mockFileOperation.bind(harness),
    runTask: harness.runTask.bind(harness),
    getCallHistory: harness.getCallHistory.bind(harness),
    getCallsTo: harness.getCallsTo.bind(harness),
    getLastCall: harness.getLastCall.bind(harness),
    clearHistory: harness.clearHistory.bind(harness),
    createCompositionTest: compositionBuilder,
    createErrorScenarioTest: errorBuilder
  };
}
