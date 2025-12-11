// Facade maintaining 100% backward compatibility with discovery modal panels
import { buildSearchPanel } from './discovery-search-panel.js';
import { buildPatternList } from './discovery-pattern-list.js';
import { buildPreviewPanel } from './discovery-preview-panel.js';

export class DiscoveryModalPanels {
  constructor(state) {
    this.state = state;
  }

  buildSearchPanel() {
    return buildSearchPanel(this.state);
  }

  buildPatternList() {
    return buildPatternList(this.state);
  }

  buildPreviewPanel() {
    return buildPreviewPanel(this.state);
  }
}
