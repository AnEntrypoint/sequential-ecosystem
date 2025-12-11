/**
 * error-context-enhancer.js
 *
 * Error enhancement with breadcrumb and state context
 */

export function createErrorContextEnhancer(breadcrumbManager, breadcrumbFormatter, stateStackManager, stateFormatter) {
  return {
    enhanceErrorWithBreadcrumbs(error) {
      if (!error) return null;

      error.breadcrumbs = breadcrumbManager.getAllBreadcrumbs();
      error.breadcrumbTrail = breadcrumbFormatter.getBreadcrumbTrail();
      error.breadcrumbChain = breadcrumbFormatter.getBreadcrumbChain();

      return error;
    },

    attachStateContextToError(error) {
      if (!error) return null;

      const currentState = stateStackManager.getCurrentState();
      error.stateContext = {
        path: stateFormatter.getStatePath(),
        chain: stateFormatter.getStateChain(),
        currentState: currentState,
        allStates: stateStackManager.getAllStates(),
        stateCount: stateStackManager.getAllStates().length
      };

      if (currentState) {
        error.failingState = currentState.state;
        error.stateIndex = currentState.index;
        error.stateInput = currentState.input;
      }

      return error;
    },

    enhanceWithFullContext(error) {
      if (!error) return null;

      this.enhanceErrorWithBreadcrumbs(error);
      this.attachStateContextToError(error);

      return error;
    }
  };
}
