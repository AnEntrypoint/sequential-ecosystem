import { createBreadcrumbTracker } from '@sequentialos/execution-context';

export function createStateContextBreadcrumbs() {
  return createBreadcrumbTracker(50);
}
