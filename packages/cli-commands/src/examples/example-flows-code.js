import { flowExamples } from './example-flows-definitions.js';
import { writeExampleFlows } from './example-flows-writer.js';

export async function createExampleFlowsCode(tasksDir) {
  await writeExampleFlows(tasksDir, flowExamples);
}
