import { createBreadcrumbTracker } from '@sequential/execution-context';

export function createStateContextBreadcrumbs() {
  return createBreadcrumbTracker(50);
}
