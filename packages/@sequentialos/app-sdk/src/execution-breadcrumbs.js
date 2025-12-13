import { createBreadcrumbTracker } from '@sequentialos/execution-context';

export function createExecutionBreadcrumbs() {
  return createBreadcrumbTracker(50);
}
