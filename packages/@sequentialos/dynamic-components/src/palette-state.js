// Command palette state management
export class PaletteState {
  constructor(patternDiscovery) {
    this.discovery = patternDiscovery;
    this.isOpen = false;
    this.searchQuery = '';
    this.selectedIndex = 0;
    this.filteredPatterns = [];
    this.onSelect = null;
  }

  open() {
    this.isOpen = true;
    this.searchQuery = '';
    this.selectedIndex = 0;
    this.filteredPatterns = this.discovery.getAllPatterns();
  }

  close() {
    this.isOpen = false;
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  setSearchQuery(query) {
    this.searchQuery = query;
    this.selectedIndex = 0;
    this.filteredPatterns = this.discovery.search(query);
  }

  selectNext() {
    if (this.selectedIndex < this.filteredPatterns.length - 1) {
      this.selectedIndex++;
    }
  }

  selectPrev() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    }
  }

  insertSelected() {
    const pattern = this.filteredPatterns[this.selectedIndex];
    if (pattern && this.onSelect) {
      this.onSelect(pattern);
      this.close();
    }
  }
}
