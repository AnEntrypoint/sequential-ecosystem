/**
 * breadcrumb-formatter.js
 *
 * Formatting and querying breadcrumb data
 */

export function createBreadcrumbFormatter(breadcrumbManager) {
  return {
    getBreadcrumbTrail() {
      const breadcrumbs = breadcrumbManager.getAllBreadcrumbs();
      return breadcrumbs.map((b) => b.tool);
    },

    getBreadcrumbChain() {
      const breadcrumbs = breadcrumbManager.getAllBreadcrumbs();
      return breadcrumbs.map((b) => `${b.tool} (${b.action})`).join(' → ');
    },

    getLastNBreadcrumbs(n) {
      const breadcrumbs = breadcrumbManager.getAllBreadcrumbs();
      return breadcrumbs.slice(-n);
    },

    getSummary() {
      const breadcrumbs = breadcrumbManager.getAllBreadcrumbs();
      return {
        totalCalls: breadcrumbs.length,
        uniqueTools: new Set(breadcrumbs.map((b) => b.tool)).size,
        successCount: breadcrumbs.filter((b) => b.action === 'success').length,
        errorCount: breadcrumbs.filter((b) => b.action === 'error').length,
        executionChain: this.getBreadcrumbChain()
      };
    }
  };
}
