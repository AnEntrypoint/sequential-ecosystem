import { validateState } from './flow-validator-state.js';
import { detectLoops, detectTimeoutRaces, detectCompensationIssues, validateParallelJoins, detectUnreachableStates } from './flow-validator-detection.js';

export function validateStateTransitions(flow, statesArray, validator) {
  const validation = {
    valid: true,
    issues: [],
    warnings: [],
    loops: [],
    unreachable: [],
    timeoutIssues: [],
    compensationIssues: []
  };

  statesArray.forEach(state => {
    validateState(state, statesArray, validation);
  });

  detectLoops(flow, statesArray, validation);
  detectTimeoutRaces(statesArray, validation);
  detectCompensationIssues(statesArray, validation);
  validateParallelJoins(statesArray, validation);

  validation.valid = validation.issues.length === 0;
  return validation;
}

export { detectUnreachableStates };
