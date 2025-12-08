import { createTrailTracker } from '@sequential/execution-context';

export function createExecutionTrail() {
  return createTrailTracker(5);
}
