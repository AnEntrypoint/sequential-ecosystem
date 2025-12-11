import { validateStateTransitions } from './flow-state-validator-methods.js';

export class FlowStateTransitionValidator {
  constructor() {
    this.visitedStates = new Set();
    this.recursionStack = new Set();
    this.issues = [];
    this.warnings = [];
  }

  validateStateTransitions(flow, statesArray) {
    return validateStateTransitions(flow, statesArray, this);
  }
}

export function createFlowStateValidator() {
  return new FlowStateTransitionValidator();
}
