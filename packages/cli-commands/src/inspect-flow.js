import path from 'path';
import { existsSync } from 'fs';
import fse from 'fs-extra';
import logger from '@sequential/sequential-logging';
import { visualizeFlowState, analyzeFlowStructure, generateFlowStateTransitions } from './generators/flow-viz-helper.js';

export async function inspectFlow(options) {
  const { flowName, verbose = false } = options;

  const flowsDir = path.resolve(process.cwd(), 'flows');
  const flowFile = path.join(flowsDir, `${flowName}.js`);

  if (!existsSync(flowFile)) {
    throw new Error(`Flow '${flowName}' not found at ${flowFile}`);
  }

  if (verbose) {
    logger.info(`Inspecting flow: ${flowName}`);
  }

  try {
    const flowModule = await import(flowFile);
    const graph = flowModule.graph;

    if (!graph) {
      throw new Error(`Flow '${flowName}' has no graph definition`);
    }

    logger.info('\n=== Flow Inspection Report ===\n');

    logger.info('1. Flow Structure');
    logger.info(visualizeFlowState(graph));

    logger.info('\n2. State Transitions');
    const transitions = generateFlowStateTransitions(graph);
    transitions.forEach(t => {
      logger.info(`  ${t.from} --[${t.trigger}]--> ${t.to}`);
    });

    logger.info('\n3. Flow Analysis');
    const analysis = analyzeFlowStructure(graph);

    if (analysis.valid) {
      logger.info(`Total states: ${analysis.analysis.totalStates}`);
      logger.info(`Final states: ${analysis.analysis.finalStates.join(', ') || 'None'}`);
      logger.info(`Parallel states: ${analysis.analysis.parallelStates.length > 0 ? analysis.analysis.parallelStates.join(', ') : 'None'}`);
      logger.info(`Task states: ${analysis.analysis.taskStates.length > 0 ? analysis.analysis.taskStates.join(', ') : 'None'}`);
      logger.info(`Code states: ${analysis.analysis.codeStates.length > 0 ? analysis.analysis.codeStates.join(', ') : 'None'}`);
      logger.info(`Complexity score: ${analysis.analysis.complexity}`);
    }

    if (analysis.warnings.length > 0) {
      logger.info('\n⚠ Warnings:');
      analysis.warnings.forEach(w => {
        logger.info(`  • ${w}`);
      });
    } else {
      logger.info('\n✓ No structural issues detected');
    }

    logger.info('\n4. Handler Availability');
    const stateNames = Object.keys(graph.states);
    for (const stateName of stateNames) {
      const state = graph.states[stateName];
      const hasHandler = state.handlerType || state.taskName || state.code;
      const status = hasHandler ? '✓' : state.type === 'final' ? '◎' : '✗';
      const handlerInfo = state.handlerType ? `[${state.handlerType}]` : state.taskName ? `[task: ${state.taskName}]` : '';
      logger.info(`  ${status} ${stateName} ${handlerInfo}`);
    }

    return {
      valid: true,
      flowName,
      graph,
      analysis: analysis.analysis,
      warnings: analysis.warnings,
      transitions
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    logger.error('✗ Flow inspection failed:', error);
    if (verbose && e instanceof Error && e.stack) {
      logger.error('Stack trace:', e.stack);
    }
    return {
      valid: false,
      error
    };
  }
}
