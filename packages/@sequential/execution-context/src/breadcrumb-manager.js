/**
 * breadcrumb-manager.js
 *
 * Breadcrumb tracking and retrieval
 */

export function createBreadcrumbManager(maxBreadcrumbs = 50) {
  const breadcrumbs = [];

  return {
    pushBreadcrumb(toolName, action = 'invoke', metadata = {}) {
      const breadcrumb = {
        tool: toolName,
        action: action,
        timestamp: new Date().toISOString(),
        metadata: metadata
      };

      breadcrumbs.push(breadcrumb);
      if (breadcrumbs.length > maxBreadcrumbs) {
        breadcrumbs.shift();
      }

      return breadcrumb;
    },

    popBreadcrumb() {
      return breadcrumbs.pop();
    },

    getCurrentBreadcrumb() {
      return breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null;
    },

    getAllBreadcrumbs() {
      return breadcrumbs.slice();
    },

    clearBreadcrumbs() {
      breadcrumbs.length = 0;
    },

    getBreadcrumbArray() {
      return breadcrumbs;
    }
  };
}
