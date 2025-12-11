// Pattern integration panels facade - maintains 100% backward compatibility
import { PatternSearchPanel } from './pattern-search-panel.js';
import { PatternPreviewPanel } from './pattern-preview-panel.js';
import { PatternStatsPanel } from './pattern-stats-panel.js';

export class PatternIntegrationPanels {
  constructor(discovery, selectedPattern, insertedPatterns) {
    this.searchPanel = new PatternSearchPanel(discovery);
    this.previewPanel = new PatternPreviewPanel(selectedPattern);
    this.statsPanel = new PatternStatsPanel(discovery, insertedPatterns);
  }

  buildPatternSearchPanel() {
    return this.searchPanel.buildPatternSearchPanel();
  }

  buildPatternPreviewPanel() {
    return this.previewPanel.buildPatternPreviewPanel();
  }

  buildInsertedPatternsPanel() {
    return this.statsPanel.buildInsertedPatternsPanel();
  }

  buildStatisticsPanel() {
    return this.statsPanel.buildStatisticsPanel();
  }
}
