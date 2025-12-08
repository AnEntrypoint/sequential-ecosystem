import { createBreadcrumbTracker } from '@sequential/execution-context';

export function createExecutionBreadcrumbs() {
  return createBreadcrumbTracker(50);
}
