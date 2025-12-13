/**
 * flow-analyzer.js - Facade for flow analysis
 *
 * Delegates to focused modules:
 * - flow-topology: Detect flow patterns (chains, branches, parallel)
 * - flow-cycles: Detect loops and cycles
 * - flow-reachability: Analyze which states are reachable
 * - flow-state-mapper: Map state connections and complexity
 * - flow-validation: Validate flow consistency and suggest improvements
 */

import { createFlowTopology } from './flow-topology.js';
import { createFlowCycleDetector } from './flow-cycles.js';
import { createFlowReachability } from './flow-reachability.js';
import { createFlowStateMapper } from './flow-state-mapper.js';
import { createFlowValidator } from './flow-validation.js';

export class FlowAnalyzer {
  constructor(statesArray, initial) {
    this.states = statesArray;
    this.initial = initial;
    this.topology = createFlowTopology(statesArray);
    this.cycleDetector = createFlowCycleDetector(statesArray);
    this.reachability = createFlowReachability(statesArray, initial);
    this.stateMapper = createFlowStateMapper(statesArray);
    this.validator = createFlowValidator(statesArray);
  }

  analyze() {
    const topology = this.topology.detect();
    const loops = this.cycleDetector.detectLoops();
    const reachable = this.reachability.detect();
    const states = this.stateMapper.map();
    const unreachable = this.reachability.getUnreachable(reachable);
    const validity = this.validator.validateConsistency(loops);
    const suggestions = this.validator.generateSuggestions(topology, loops, unreachable);

    return { states, topology, analysis: { validity, loops, reachable, unreachable, suggestions } };
  }

  detectTopology() {
    return this.topology.detect();
  }

  detectLoops() {
    return this.cycleDetector.detectLoops();
  }

  detectReachability() {
    return this.reachability.detect();
  }

  getUnreachable(reachable) {
    return this.reachability.getUnreachable(reachable);
  }

  mapStates() {
    return this.stateMapper.map();
  }

  validateConsistency(loops) {
    return this.validator.validateConsistency(loops);
  }

  generateSuggestions(topology, loops, reachable) {
    const unreachable = this.getUnreachable(reachable);
    return this.validator.generateSuggestions(topology, loops, unreachable);
  }
}
