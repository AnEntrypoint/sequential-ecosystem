/**
 * command-navigator.js
 *
 * Command selection and navigation (up/down arrow keys)
 */

export function createCommandNavigator(getFilteredCommands) {
  return {
    selectedIndex: 0,

    selectNext() {
      const count = getFilteredCommands().length;
      this.selectedIndex = Math.min(this.selectedIndex + 1, count - 1);
    },

    selectPrevious() {
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
    },

    selectByIndex(index) {
      this.selectedIndex = index;
    },

    getSelectedCommand() {
      return getFilteredCommands()[this.selectedIndex];
    },

    resetSelection() {
      this.selectedIndex = 0;
    }
  };
}
