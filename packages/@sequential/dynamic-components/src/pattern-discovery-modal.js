// Pattern discovery modal facade - maintains 100% backward compatibility
import { DiscoveryModalState } from './discovery-modal-state.js';
import { DiscoveryModalPanels } from './discovery-modal-panels.js';
import { DiscoveryModalRenderer } from './discovery-modal-renderer.js';

class PatternDiscoveryModal {
  constructor(libraries) {
    this.state = new DiscoveryModalState(libraries);
    this.panels = new DiscoveryModalPanels(this.state);
    this.renderer = new DiscoveryModalRenderer(this.state, this.panels);
  }

  open() {
    return this.state.open();
  }

  close() {
    return this.state.close();
  }

  setSearchQuery(query) {
    return this.state.setSearchQuery(query);
  }

  setCategory(category) {
    return this.state.setCategory(category);
  }

  selectPattern(pattern) {
    return this.state.selectPattern(pattern);
  }

  getFilteredPatterns() {
    return this.state.getFilteredPatterns();
  }

  buildSearchPanel() {
    return this.panels.buildSearchPanel();
  }

  buildPatternList() {
    return this.panels.buildPatternList();
  }

  buildPreviewPanel() {
    return this.panels.buildPreviewPanel();
  }

  buildModal() {
    return this.renderer.buildModal();
  }

  render() {
    return this.renderer.render();
  }

  // Expose internal state for backward compatibility
  get isOpen() {
    return this.state.isOpen;
  }

  get searchQuery() {
    return this.state.searchQuery;
  }

  get selectedCategory() {
    return this.state.selectedCategory;
  }

  get selectedPattern() {
    return this.state.selectedPattern;
  }

  get discovery() {
    return this.state.discovery;
  }
}

function createPatternDiscoveryModal(libraries) {
  return new PatternDiscoveryModal(libraries);
}

export { PatternDiscoveryModal, createPatternDiscoveryModal };
