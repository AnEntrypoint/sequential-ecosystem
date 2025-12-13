/**
 * Flow Parallel Runner
 * Executes parallel flows with branch coordination
 *
 * Delegates to:
 * - flow-parallel-executor: Branch execution and join condition evaluation
 * - flow-parallel-runner-factory: Parallel flow runner creation
 */

import { createParallelFlowRunner } from './flow-parallel-runner-factory.js';

export { createParallelFlowRunner };
