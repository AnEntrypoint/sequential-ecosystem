/**
 * command-filter.js
 *
 * Command filtering and search
 */

export function createCommandFilter(commands) {
  return {
    filterValue: '',

    filter(query) {
      if (!query) {
        return commands;
      }
      const lowerQuery = query.toLowerCase();
      return commands.filter(cmd =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.category.toLowerCase().includes(lowerQuery)
      );
    },

    setFilter(query) {
      this.filterValue = query;
      return this.filter(query);
    },

    getFilteredCount() {
      return this.filter(this.filterValue).length;
    }
  };
}
