import { createTrailTracker } from '@sequentialos/execution-context';

export function createExecutionTrail() {
  return createTrailTracker(5);
}
